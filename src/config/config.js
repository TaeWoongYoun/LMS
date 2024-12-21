const config = {
    development: {
        API_URL: 'http://localhost:3001'
    },
    production: {
        API_URL: 'http://localhost:3001'
    },
    test: {
        API_URL: 'http://localhost:3001'
    }
};

const environment = process.env.REACT_APP_ENV || 'development';
export const API_URL = config[environment].API_URL;