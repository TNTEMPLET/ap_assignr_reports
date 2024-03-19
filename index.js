
// async function getBearerToken() {
//     const url = 'https://app.assignr.com/oauth/token';
//     const data = {
//       client_id: 'KYX4Fa85OCO1DTjMS0ji-OoGaf3TISfnvnzgY0kpYxg',
//       client_secret: 'DfRIvDtg9gq0Kw0k2pRQVh6frPm6T0A573wPtU8zvnY',
//       scope: 'read',
//       grant_type: 'client_credentials'
//       // Add any other necessary parameters here
//     };
  
//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           // Add any other necessary headers here
//         },
//         body: JSON.stringify(data)
//       });
  
//       if (!response.ok) {
//         throw new Error('Failed to get token');
//       }
  
//       const responseData = await response.json();
//       const token = responseData.access_token; // Adjust this according to your API response structure
  
//       return token;
//     } catch (error) {
//       console.error('Error:', error);
//       return null;
//     }
//   }
  
//   // Example usage:
// //   async function fetchDataWithBearerToken() {
// //     const token = await getBearerToken();
// //     const id = '18601'
// //     const options = {
// //         method: 'GET',
// //         headers: {
// //           accept: 'application/json',
// //           authorization: `Bearer ${token}`,
// //         }
// //       };
      
// //     fetch(`https://api.assignr.com/api/v2/sites/${id}/games?search[start_date]=2024-03-25&search[end_date]=2024-03-31`, options)
// //     .then(response => response.json())
// //     .then(parsedData => {
// //         // Your existing code to handle the parsed JSON response
// //         console.log(parsedData);

// //         // Parse all games data
// //         const allGames = parsedData._embedded.games;

// //         // Process each game object
// //         allGames.forEach((game, index) => {
// //             console.log(`Game ${index + 1}:`);
// //             console.log("Game ID:", game.id);
// //             console.log("Start Time:", game.start_time);
// //             console.log("Home Team:", game.home_team);
// //             console.log("Away Team:", game.away_team);
// //             console.log("Assignments:", game._embedded.assignments.first_name);
// //             // Access other properties as needed
// //             console.log("\n");
// //         });
        
// //         // Continue with any other logic you have after processing the response
// //     })
// //     .catch(err => console.error(err));
// //   }

// async function fetchDataWithBearerToken() {
//     const token = await getBearerToken();
//     const id = '18601';
//     const options = {
//         method: 'GET',
//         headers: {
//           accept: 'application/json',
//           authorization: `Bearer ${token}`,
//         }
//     };
      
//     fetch(`https://api.assignr.com/api/v2/sites/${id}/games?search[start_date]=2024-03-25&search[end_date]=2024-03-31`, options)
//     .then(response => response.json())
//     .then(parsedData => {
//         // Your existing code to handle the parsed JSON response
//         console.log(parsedData);

//         // Function to pull relevant information from assignments
//         function extractInformation(jsonData) {
//             const games = jsonData["_embedded"]["games"];
//             const information = [];

//             games.forEach(game => {
//                 const assignments = game["_embedded"]["assignments"];
//                 const { localized_date, start_time } = game;
//                 const venue = game["_embedded"]["venue"]["name"];
//                 const subVenue = game["subvenue"];

//                 assignments.forEach(assignment => {
//                     const { first_name, last_name } = assignment["_embedded"]["official"];
//                     const position = assignment["position"];
//                     information.push({ localized_date, start_time, venue, subVenue, position, first_name, last_name });
//                 });
//             });

//             return information;
//         }

//         // Extract information from assignments
//         const extractedInformation = extractInformation(parsedData);
//         console.log(extractedInformation);
        
//         // Continue with any other logic you have after processing the response
//     })
//     .catch(err => console.error(err));
// }

async function getBearerToken() {
    const url = 'https://app.assignr.com/oauth/token';
    const data = {
        client_id: 'KYX4Fa85OCO1DTjMS0ji-OoGaf3TISfnvnzgY0kpYxg',
        client_secret: 'DfRIvDtg9gq0Kw0k2pRQVh6frPm6T0A573wPtU8zvnY',
        scope: 'read',
        grant_type: 'client_credentials'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to get token');
        }

        const responseData = await response.json();
        const token = responseData.access_token;
        return token;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function fetchDataWithBearerToken() {
    try {
        const token = await getBearerToken();
        const id = '18601';
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${token}`,
            }
        };

        const response = await fetch(`https://api.assignr.com/api/v2/sites/${id}/games?search[start_date]=2024-03-17&search[end_date]=2024-03-23`, options);

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const parsedData = await response.json();

        // Function to extract relevant information from assignments
        function extractInformation(jsonData) {
            const games = jsonData._embedded.games;
            const information = [];
        
            // Define a mapping of age_group and position to fees
            const feeMapping = {
                '9 Majors': {
                    'Field': 30,
                    'Plate': 50
                },
                '10 Majors': {
                    'Field': 30,
                    'Plate': 50
                },
                '11-12 Majors': {
                    'Field': 30,
                    'Plate': 50
                },

            };
        
            games.forEach(game => {
                const assignments = game._embedded.assignments;
        
                if (assignments && Array.isArray(assignments)) { // Check if assignments is defined and is an array
                    assignments.forEach(assignment => {
                        const official = assignment._embedded && assignment._embedded.official;
                        if (official) { // Check if official is defined
                            const age_group = game.age_group || ''; // Get age_group, defaulting to an empty string if not present
                            const position = assignment.position || ''; // Get position, defaulting to an empty string if not present
        
                            // Determine the fee based on age_group and position
                            let fee = 0;
                            if (feeMapping[age_group] && feeMapping[age_group][position]) {
                                fee = feeMapping[age_group][position];
                            }
        
                            information.push({
                                localized_date: game.localized_date,
                                start_time: game.start_time,
                                venue: game._embedded.venue.name,
                                subVenue: game.subvenue,
                                position: position,
                                first_name: official.first_name,
                                last_name: official.last_name,
                                age_group: age_group,
                                fee: fee // Include the fee
                            });
                        }
                    });
                }
            });
        
            return information;
        }

        // Extract information from assignments
        const extractedInformation = extractInformation(parsedData);
        console.log(extractedInformation);

        // Continue with any other logic you have after processing the response
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchDataWithBearerToken();  