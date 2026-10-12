import React, { useEffect } from 'react';
// import { useParams } from 'react-router-dom';
import axios from 'axios'; // Import axios for making HTTP requests
import jwt_decode from 'jsonwebtoken';
import { useRouter } from 'next/router';
const SpecificApproval = () => {
    const router = useRouter();
    const { pnr, token } = router.query;
    // const { pnr, token } = useParams();

    useEffect(() => {
        handleSpecificApproval();
    }, []); // Empty dependency array ensures that the effect runs only once after the component mounts

    const handleSpecificApproval = async () => {
        try {
            // Decode the JWT token using the secret key
            const decodedToken = jwt_decode(token, 'your_secret_key_here');

            // Check if the token is valid
            if (decodedToken) {
                console.log('Token is valid:', decodedToken);

                // Implement your Axios call here to handle the approval request
                // Use the decoded token and pnr in your Axios call headers
                // Example:
                const response = await axios.post('/api/handle-approval', { pnr, token }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log('Approval request handled successfully:', response.data);
            } else {
                console.log('Invalid token');
            }
        } catch (error) {
            console.error('Error handling specific approval:', error);
        }
    };

    return (
        <div>
            <h1>Handling Approval for PNR: {pnr} and Token: {token}</h1>
            {/* You can add more UI elements here */}
        </div>
    );
};

export default SpecificApproval;
