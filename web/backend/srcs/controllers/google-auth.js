import { OAuth2Client } from 'google-auth-library';
import { getUserByGoogleId, getUserByMail, insertGoogleUser, saveToken, getTokenByUsername, tokenExists } from '../database_comunication/user_db.js';

const GOOGLE_CLIENT_ID = '575747097249-3bu3g738p6s49pisr9ael83r4p5p1urv.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export default async function (fastify, opts) {
    fastify.post('/auth/google', async (request, reply) => {
        try {
            const { credential } = request.body;
            
            if (!credential) {
                return reply.code(400).send({ error: 'Google credential is required' });
            }

            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload) {
                return reply.code(400).send({ error: 'Invalid Google token' });
            }

            const { sub: googleId, email, name } = payload;

            let user = await getUserByGoogleId(googleId);
            
            if (!user) {
                const existingUser = await getUserByMail(email);
                if (existingUser && !existingUser.google_id) {
                    return reply.code(400).send({ 
                        error: 'An account with this email already exists. Please use your email and password to log in.' 
                    });
                }
                
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
            fastify.log.error('Google auth error:', error.message || error);
            return reply.code(500).send({ error: 'Authentication failed' });
        }
    });
}
