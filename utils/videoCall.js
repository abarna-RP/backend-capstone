// utils/videocall.js
import dotenv from 'dotenv';
import pkg from 'agora-access-token';
dotenv.config();

const { RtcTokenBuilder, RtcRole } = pkg;

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

/**
 * Generates an Agora token for a user.
 * @param {string} channelName - The name of the channel.
 * @param {string} uid - The user ID.  This should be unique for each user in the channel.
 * @param {string} roleString -  "client" or "counselor"
 * @returns {string} The Agora token.
 */
export const generateAgoraToken = (channelName, uid, roleString) => {
    // Determine the role based on the roleString
    let role = RtcRole.PUBLISHER; // Default
    if (roleString === 'client') {
        role = RtcRole.PUBLISHER; // Client can publish and subscribe
    } else if (roleString === 'counselor') {
        role = RtcRole.PUBLISHER; // Counselor can publish and subscribe
    }
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    return RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        parseInt(uid),
        role,
        privilegeExpiredTs
    );
};
