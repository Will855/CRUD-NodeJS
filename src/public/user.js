export default class User {
    //#region SINGLETON PATTERN
    static instance = null;

    constructor() {
        if (User.instance) return User.instance;

        this._initProperties();
        User.instance = this;
    }
    //#endregion

    //#region PRIVATE METHODS
    _initProperties() {
        this._name = null;
        this._email = null;
        this._password = null;

        this.isAuth = false;
        this.token = null;

        this.paymentMethod = null;
        this.availablePaymentMethods = [];
    }

    _validateLoginFields(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
    }
    //#endregion

    //#region PUBLIC API - AUTHENTICATION
    async login(email, password) {
        try {
            this._validateLoginFields(email, password);

            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }) 
            });

            await this._processLoginResponse(response);

        } catch (error) {
            this.isAuth = false;
            console.error(`Login error: ${error.message}`);
            throw error;
        }
    }

    logout() {
        this.isAuth = false;
        this.token = null;
        console.log("Session closed successfully");
    }
    //#endregion

    //#region PUBLIC API - PASSWORD MANAGEMENT
    changePassword(currentPassword, newPassword) {
        if (this._password !== currentPassword) { 
            throw new Error('Current password is incorrect');
        }

        this._password = newPassword; 
        console.log("Password updated successfully");
    }
    //#endregion

    //#region PUBLIC API - PAYMENT METHODS
    addPaymentMethod(method) {
        this.availablePaymentMethods.push(method);
        console.log(`Payment method ${method} added`);
    }

    selectPaymentMethod(method) {
        if (!this.availablePaymentMethods.includes(method)) {
            throw new Error('Payment method not available');
        }

        this.paymentMethod = method;
        console.log(`Payment method ${method} selected`);
    }
    //#endregion

    //#region GETTERS & SETTERS (Corregidos)
    get user() {
        if (!this.isAuth) return null;

        return {
            name: this._name, 
            email: this._email,
            paymentMethod: this.paymentMethod
        };
    }

    get name() {
        return this._name;
    }

    set name(newName) {
        if (typeof newName !== 'string' || newName.length < 3) {
            throw new Error('Invalid name');
        }
        this._name = newName; 
    }

    get email() {
        return this._email;
    }

    set email(newEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            throw new Error('Invalid email format');
        }
        this._email = newEmail; 
    }
    //#endregion

    //#region PRIVATE AUTH HANDLERS
    async _processLoginResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Authentication error');
        }

        this.isAuth = true;
        this.token = data.token;
        this._updateUserData(data.user);
        console.log("Authentication successful", this.user);
    }

    _updateUserData(userData) {
        // Mapear campos del backend al frontend
        this.name = userData.name;
        this.email = userData.email;
        this.availablePaymentMethods = userData.paymentMethods || [];
    }
    //#endregion
}