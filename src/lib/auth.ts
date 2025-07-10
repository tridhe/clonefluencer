import { 
  CognitoUserPool, 
  CognitoUser, 
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession
} from 'amazon-cognito-identity-js';

// AWS Cognito configuration
const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID || '',
  ClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID || ''
};

const userPool = new CognitoUserPool(poolData);

export interface User {
  email: string;
  name?: string;
  sub: string;
  email_verified?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

class AuthService {
  // Sign up new user
  async signUp(email: string, password: string, name: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email
        }),
        new CognitoUserAttribute({
          Name: 'name',
          Value: name
        })
      ];

      // Generate a unique username from email (remove @ and . characters)
      const username = email.replace(/[@.]/g, '_').toLowerCase();
      
      userPool.signUp(username, password, attributeList, [], (err: any) => {
        if (err) {
          resolve({ 
            success: false, 
            message: err.message || 'Sign up failed' 
          });
          return;
        }
        
        resolve({ 
          success: true, 
          message: 'Please check your email for verification code' 
        });
      });
    });
  }

  // Confirm sign up with verification code
  async confirmSignUp(email: string, code: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      // Generate the same username format as signup
      const username = email.replace(/[@.]/g, '_').toLowerCase();
      
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });

      cognitoUser.confirmRegistration(code, true, (err: any) => {
        if (err) {
          resolve({ 
            success: false, 
            message: err.message || 'Verification failed' 
          });
          return;
        }
        
        resolve({ 
          success: true, 
          message: 'Account verified successfully' 
        });
      });
    });
  }

  // Sign in user
  async signIn(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    return new Promise((resolve) => {
      // Generate the same username format as signup
      const username = email.replace(/[@.]/g, '_').toLowerCase();
      
      const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password
      });

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session: CognitoUserSession) => {
          const payload = session.getIdToken().payload;
          const user: User = {
            email: payload.email,
            name: payload.name,
            sub: payload.sub,
            email_verified: payload.email_verified
          };
          
          resolve({ 
            success: true, 
            message: 'Sign in successful',
            user 
          });
        },
        onFailure: (err) => {
          resolve({ 
            success: false, 
            message: err.message || 'Sign in failed' 
          });
        }
      });
    });
  }

  // Sign out user
  async signOut(): Promise<void> {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  }

  // Get current authenticated user
  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const cognitoUser = userPool.getCurrentUser();
      
      if (!cognitoUser) {
        resolve(null);
        return;
      }

      cognitoUser.getSession((err: unknown, session: CognitoUserSession) => {
        if (err || !session.isValid()) {
          resolve(null);
          return;
        }

        const payload = session.getIdToken().payload;
        const user: User = {
          email: payload.email,
          name: payload.name,
          sub: payload.sub,
          email_verified: payload.email_verified
        };
        
        resolve(user);
      });
    });
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  // Get access token for API calls
  async getAccessToken(): Promise<string | null> {
    return new Promise((resolve) => {
      const cognitoUser = userPool.getCurrentUser();
      
      if (!cognitoUser) {
        resolve(null);
        return;
      }

      cognitoUser.getSession((err: unknown, session: CognitoUserSession) => {
        if (err || !session.isValid()) {
          resolve(null);
          return;
        }

        resolve(session.getAccessToken().getJwtToken());
      });
    });
  }

  // Check if user is a hackathon judge
  isHackathonJudge(user: User | null): boolean {
    if (!user?.email) return false;
    
    const judgeEmails = [
      'genaihackathon2025@impetus.com',
      'testing@devpost.com'
    ];
    
    return judgeEmails.includes(user.email.toLowerCase());
  }

  // Get user privileges based on judge status
  getUserPrivileges(user: User | null) {
    const isJudge = this.isHackathonJudge(user);
    
    return {
      isJudge,
      unlimitedGenerations: isJudge,
      priorityProcessing: isJudge,
      accessToAllModels: isJudge,
      maxGenerationsPerMonth: isJudge ? -1 : 5, // -1 = unlimited
      maxResolution: isJudge ? 1024 : 512
    };
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      // Generate the same username format as signup
      const username = email.replace(/[@.]/g, '_').toLowerCase();
      
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });

      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve({ 
            success: true, 
            message: 'Password reset code sent to your email' 
          });
        },
        onFailure: (err) => {
          resolve({ 
            success: false, 
            message: err.message || 'Failed to send reset code' 
          });
        }
      });
    });
  }

  // Confirm forgot password
  async confirmPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      // Generate the same username format as signup
      const username = email.replace(/[@.]/g, '_').toLowerCase();
      
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve({ 
            success: true, 
            message: 'Password reset successful' 
          });
        },
        onFailure: (err) => {
          resolve({ 
            success: false, 
            message: err.message || 'Password reset failed' 
          });
        }
      });
    });
  }
}

export const authService = new AuthService();
export { userPool }; 