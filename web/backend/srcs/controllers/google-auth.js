import { OAuth2Client } from 'google-auth-library';
import { getUserByGoogleId, getUserByMail, insertGoogleUser, saveToken, getTokenByUsername, tokenExists } from '../database_comunication/user_db.js';

const GOOGLE_CLIENT_ID = '575747097249-3bu3g738p6s49pisr9ael83r4p5p1urv.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export default async function (fastify, opts) {
    // Endpoint per verificare il token Google e autenticare l'utente
    fastify.post('/auth/google', async (request, reply) => {
        try {
            const { credential } = request.body;
            
            if (!credential) {
                return reply.code(400).send({ error: 'Google credential is required' });
            }

            // Verifica il token Google
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload) {
                return reply.code(400).send({ error: 'Invalid Google token' });
            }

            const { sub: googleId, email, name } = payload;

            // Controlla se l'utente esiste già con questo Google ID
            let user = await getUserByGoogleId(googleId);
            
            if (!user) {
                // Controlla se esiste già un utente con questa email (registrato con password)
                const existingUser = await getUserByMail(email);
                if (existingUser && !existingUser.google_id) {
                    // Utente esiste con registrazione tradizionale - non permettere login Google
                    return reply.code(400).send({ 
                        error: 'An account with this email already exists. Please use your email and password to log in.' 
                    });
                }
                
                // Crea nuovo utente Google
                const newUser = await insertGoogleUser({
                    username: name || email.split('@')[0],
                    mail: email,
                    google_id: googleId
                });
                
                user = {
                    id: newUser.id,
                    username: name || email.split('@')[0],
                    mail: email,
                    google_id: googleId
                };
            }

            // Genera o recupera token JWT
            let token = '';
            if (await tokenExists(user.username)) {
                token = await getTokenByUsername(user.username);
            } else {
                token = fastify.jwt.sign({
                    id: user.id,
                    mail: user.mail,
                    username: user.username,
                    google_id: user.google_id
                });
                await saveToken(user.username, token);
            }

            reply.send({
                token,
                user: {
                    id: user.id,
                    mail: user.mail,
                    username: user.username,
                    google_id: user.google_id
                }
            });

        } catch (error) {
            console.error('Full error object:', error);
            fastify.log.error('Google auth error message:', error.message);
            fastify.log.error('Google auth error toString:', error.toString());
            return reply.code(500).send({ 
                error: 'Authentication failed', 
                details: error.message || error.toString() || 'Unknown error'
            });
        }
    });
}
