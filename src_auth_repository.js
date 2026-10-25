```javascript
import { User } from '../models/User';
import { AuthStrategy } from './strategies/authStrategy';
import { LocalStrategy } from './strategies/localStrategy';
import { OAuthStrategy } from './strategies/oauthStrategy';
import { logger } from '../logs/logger';

class AuthRepository {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async authenticate(username, password) {
    try {
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      const user = await User.findOne({ where: { username } });
      if (!user) {
        throw new Error('User not found');
      }

      const isAuthenticated = await this.strategy.authenticate(user, password);
      if (!isAuthenticated) {
        throw new Error('Authentication failed');
      }

      logger.info(`User ${username} authenticated successfully`);
      return user;
    } catch (error) {
      logger.error(`Authentication failed for user ${username}: ${error.message}`);
      throw error;
    }
  }
}

export const authRepository = new AuthRepository(new LocalStrategy());

// Estrategias de autenticación
class LocalStrategy {
  async authenticate(user, password) {
    return user.validatePassword(password);
  }
}

class OAuthStrategy {
  async authenticate(user, token) {
    // Lógica para autenticar con OAuth
    const response = await fetch('https://api.oauth.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    return data.authenticated;
  }
}

// Uso de la estrategia de autenticación
const oauthStrategy = new OAuthStrategy();
const localStrategy = new LocalStrategy();

// Ejemplo de uso
const auth = new AuthRepository(localStrategy);
auth.authenticate('username', 'password').then(user => console.log(user)).catch(err => console.error(err.message));
```