import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Approval = () => {
    // Define state to store the fetched data
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Define a function to fetch data from the API endpoint
        const fetchData = async () => {
            try {
                // Make the API request using axios
                const response = await axios.get('/api/approvals'); // Update the URL with your actual API endpoint

                // Set the fetched data to the state
                setData(response.data);
            } catch (error) {
                // Handle errors
                setError(error.message);
            }
        };

        // Call the fetchData function when the component mounts
        fetchData();

        // Clean up function
        return () => {
            // You can perform cleanup actions here if needed
        };
    }, []); // Empty dependency array ensures that the effect runs only once after the component mounts

    return (
        <div>
            {error ? (
                <p>Error: {error}</p>
            ) : (
                <div>
                    <p>Your form is submitted successfully</p>
                    {data && (
                        <div>
                            {/* Render the fetched data */}
                            {/* Example: <p>{data.someKey}</p> */}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Approval;
