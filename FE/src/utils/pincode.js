import axios from "axios";

async function getStateAndCity(pincode) {
    try {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);

        if (response.data && response.data.length > 0) {
            const data = response.data[0];

            if (data.Status === 'Success') {
                const location = data.PostOffice[0];
                const state = location.State;
                const city = location.District;
                console.log(`State: ${state}, City: ${city}`);
            } else {
                console.log('Invalid pincode');
            }
        } else {
            console.log('No data found for the given pincode');
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

// Example usage:
const pincode = '494556'; // Replace with the desired pincode
getStateAndCity(pincode);
