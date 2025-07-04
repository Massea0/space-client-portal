// src/services/onboarding/emailService.ts
// Service pour l'envoi d'emails dans le processus d'onboarding

interface EmailCredentials {
  to: string;
  employeeName: string;
  temporaryPassword: string;
  loginUrl: string;
  employeeNumber: string;
}

interface EmailDocument {
  to: string;
  employeeName: string;
  documentName: string;
  documentUrl: string;
  signatureUrl?: string;
}

interface EmailRecovery {
  to: string;
  employeeName: string;
  recoveryToken: string;
  recoveryUrl: string;
}

export class EmailService {
  
  /**
   * Envoie les identifiants de connexion à l'email personnel
   */
  async sendCredentials(data: EmailCredentials): Promise<void> {
    const emailContent = this.generateCredentialsEmail(data);
    
    // TODO: Intégrer avec un vrai service d'email (SendGrid, Mailgun, etc.)
    console.log('📧 Envoi email identifiants:', {
      to: data.to,
      subject: 'Vos identifiants de connexion - Bienvenue dans l\'équipe !',
      content: emailContent
    });
    
    // Simulation de l'envoi
    await this.simulateEmailSend();
  }

  /**
   * Envoie un document à signer
   */
  async sendDocumentForSignature(data: EmailDocument): Promise<void> {
    const emailContent = this.generateDocumentEmail(data);
    
    console.log('📧 Envoi document à signer:', {
      to: data.to,
      subject: `Document à signer: ${data.documentName}`,
      content: emailContent
    });
    
    await this.simulateEmailSend();
  }

  /**
   * Envoie un lien de récupération de mot de passe
   */
  async sendPasswordRecovery(data: EmailRecovery): Promise<void> {
    const emailContent = this.generateRecoveryEmail(data);
    
    console.log('📧 Envoi récupération mot de passe:', {
      to: data.to,
      subject: 'Récupération de votre mot de passe',
      content: emailContent
    });
    
    await this.simulateEmailSend();
  }

  /**
   * Génère le contenu HTML pour l'email des identifiants
   */
  private generateCredentialsEmail(data: EmailCredentials): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Vos identifiants de connexion</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .credentials { background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #10b981; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bienvenue dans l'équipe !</h1>
              <p>Vos identifiants de connexion sont prêts</p>
            </div>
            
            <div class="content">
              <h2>Bonjour ${data.employeeName},</h2>
              
              <p>Félicitations ! Votre compte a été créé avec succès. Voici vos identifiants de connexion :</p>
              
              <div class="credentials">
                <h3>📋 Vos identifiants</h3>
                <p><strong>Numéro employé :</strong> ${data.employeeNumber}</p>
                <p><strong>Mot de passe temporaire :</strong> <code>${data.temporaryPassword}</code></p>
              </div>
              
              <div class="warning">
                <h4>🔒 Important - Sécurité</h4>
                <p>Pour votre sécurité, vous devrez changer ce mot de passe lors de votre première connexion.</p>
                <p>Ce mot de passe temporaire expire dans 7 jours.</p>
              </div>
              
              <p>
                <a href="${data.loginUrl}" class="button">Se connecter maintenant</a>
              </p>
              
              <h3>📚 Prochaines étapes</h3>
              <ul>
                <li>Connectez-vous avec vos identifiants</li>
                <li>Modifiez votre mot de passe temporaire</li>
                <li>Complétez votre profil</li>
                <li>Signez les documents d'onboarding</li>
              </ul>
              
              <h3>🆘 Besoin d'aide ?</h3>
              <p>Si vous rencontrez des difficultés, contactez notre équipe RH ou IT support.</p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement dans le cadre de votre processus d'onboarding.</p>
              <p>Merci de ne pas répondre à cet email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Génère le contenu HTML pour l'email de document à signer
   */
  private generateDocumentEmail(data: EmailDocument): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Document à signer</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .document { background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #8b5cf6; }
            .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .button.secondary { background: #6b7280; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 Document à signer</h1>
              <p>Votre signature est requise</p>
            </div>
            
            <div class="content">
              <h2>Bonjour ${data.employeeName},</h2>
              
              <p>Un nouveau document nécessite votre signature pour finaliser votre processus d'onboarding.</p>
              
              <div class="document">
                <h3>📄 Document : ${data.documentName}</h3>
                <p>Ce document a été généré automatiquement avec vos informations.</p>
                <p>Veuillez le réviser attentivement avant de le signer.</p>
              </div>
              
              <p>
                <a href="${data.documentUrl}" class="button secondary">📖 Consulter le document</a>
                ${data.signatureUrl ? `<a href="${data.signatureUrl}" class="button">✍️ Signer maintenant</a>` : ''}
              </p>
              
              <h3>ℹ️ Informations importantes</h3>
              <ul>
                <li>Consultez attentivement le document avant signature</li>
                <li>La signature électronique a la même valeur légale qu'une signature manuscrite</li>
                <li>Une copie signée vous sera envoyée par email</li>
                <li>En cas de question, contactez le service RH</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement dans le cadre de votre processus d'onboarding.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Génère le contenu HTML pour l'email de récupération de mot de passe
   */
  private generateRecoveryEmail(data: EmailRecovery): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Récupération de mot de passe</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .recovery { background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #dc2626; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Récupération de mot de passe</h1>
              <p>Réinitialisez votre mot de passe</p>
            </div>
            
            <div class="content">
              <h2>Bonjour ${data.employeeName},</h2>
              
              <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
              
              <div class="recovery">
                <h3>🔑 Lien de récupération</h3>
                <p>Token : <code>${data.recoveryToken}</code></p>
              </div>
              
              <p>
                <a href="${data.recoveryUrl}" class="button">Réinitialiser mon mot de passe</a>
              </p>
              
              <div class="warning">
                <h4>⚠️ Important</h4>
                <p>Ce lien expire dans 1 heure pour des raisons de sécurité.</p>
                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
              </div>
              
              <h3>🆘 Besoin d'aide ?</h3>
              <p>Si le lien ne fonctionne pas, contactez notre support IT avec votre numéro employé.</p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement pour des raisons de sécurité.</p>
              <p>Merci de ne pas répondre à cet email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Simule l'envoi d'email (à remplacer par un vrai service)
   */
  private async simulateEmailSend(): Promise<void> {
    // Simulation d'un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulation d'un taux de succès de 95%
    if (Math.random() < 0.05) {
      throw new Error('Échec de l\'envoi d\'email (simulation)');
    }
  }

  /**
   * Génère un token de récupération sécurisé
   */
  generateRecoveryToken(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Génère un mot de passe temporaire sécurisé
   */
  generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let password = '';
    
    // Au moins une majuscule, une minuscule, un chiffre et un caractère spécial
    password += 'ABCDEFGHJKMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)];
    password += 'abcdefghijkmnpqrstuvwxyz'[Math.floor(Math.random() * 23)];
    password += '23456789'[Math.floor(Math.random() * 8)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Compléter avec des caractères aléatoires
    for (let i = 4; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Mélanger les caractères
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// Instance singleton
export const emailService = new EmailService();
export default emailService;
