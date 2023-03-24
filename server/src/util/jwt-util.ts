import jsonwebtoken from 'jsonwebtoken';
import EnvVars from '../declarations/major/EnvVars';


// **** Variables **** //

// Errors
const errors = {
    validation: 'JSON-web-token validation failed.',
} as const;


// **** Functions **** //

/**
 * Encrypt data and return access jwt.
 */
function sign(data: string | object | Buffer, type: string = 'access'): Promise<string> {
    const { secret, exp } = tokenOptions(type);
    return new Promise((res, rej) => {
        jsonwebtoken.sign(data, secret, { expiresIn: exp, }, (err, token) => {
            return err ? rej(err) : res(token || '');
        });
    });
}

/**
 * Decrypt JWT and extract client data.
 */
function decode<T>(jwt: string, type: string = 'access'): Promise<T | string> {
    const { secret } = tokenOptions(type);

    return new Promise((res, rej) => {
        jsonwebtoken.verify(jwt, secret, (err, decoded) => {
            return err ? rej(errors.validation) : res(decoded as T);
        });
    });
}


/**
 * Checks the type of token and returns the appropriate
 * env variables 
 * */
function tokenOptions(type: string) {
    if (type === 'access')
        return { secret: EnvVars.jwt.accessSecret, exp: EnvVars.jwt.accessExp };
    else
        return { secret: EnvVars.jwt.refreshSecret, exp: EnvVars.jwt.refreshExp };
}


// **** Export default **** //

export default {
    sign,
    decode,
} as const;