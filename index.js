async function getBearerToken() {
    const url = 'http://localhost:3000/oauth/token';
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

        const response = await fetch(`http://localhost:3000/api/v2/sites/${id}/games?search[start_date]=2024-03-17&search[end_date]=2024-03-23`, options);

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
        return extractedInformation;

        // Continue with any other logic you have after processing the response
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to get the start date of the week for a given date
function getWeekStartDate(dateString) {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - dayOfWeek); // Move to the start of the week (Sunday)
    return startDate.toISOString().slice(0, 10); // Return the date in YYYY-MM-DD format
}

// Function to get the end date of the week for a given date
function getWeekEndDate(startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // Move to the end of the week (Saturday)
    return endDate.toISOString().slice(0, 10); // Return the date in YYYY-MM-DD format
}
// Function to group data by Venue and Date
function groupDataByVenueAndDate(data) {
    const groupedData = {};

    data.forEach(item => {
        const key = `${item.venue}_${item.start_time}`;
        if (!groupedData[key]) {
            groupedData[key] = [];
        }
        groupedData[key].push(item);
    });

    return Object.values(groupedData);
}

// Function to calculate fee totals by day
function calculateFeeTotalByDay(groupedData) {
    return groupedData.map(group => {
        const feeTotal = group.reduce((total, item) => total + item.fee, 0);
        return { ...group[0], feeTotal };
    });
}

// Function to calculate fee totals by week
function calculateFeeTotalByWeek(groupedData) {
    const feeTotalByWeek = {};

    groupedData.forEach(group => {
        const weekStartDate = getWeekStartDate(group[0].start_time); // Implement getWeekStartDate function
        if (!feeTotalByWeek[weekStartDate]) {
            feeTotalByWeek[weekStartDate] = 0;
        }
        feeTotalByWeek[weekStartDate] += group.reduce((total, item) => total + item.fee, 0);
    });

    return Object.entries(feeTotalByWeek).map(([startDate, feeTotal]) => ({
        startDate,
        endDate: getWeekEndDate(startDate), // Implement getWeekEndDate function
        feeTotal
    }));
}


function createTable(data) {
    if (!data || data.length === 0) {
        console.error('Data is empty or undefined.');
        return;
    }

    // Group data by Venue
    const groupedByVenue = groupDataByVenue(data);

    // Create tables for each Venue
    groupedByVenue.forEach(venueGroup => {
        const venueTable = createVenueTable(venueGroup);
        document.getElementById('table-container').appendChild(venueTable);
    });
}

// Function to group data by Venue
function groupDataByVenue(data) {
    const groupedData = {};
    data.forEach(item => {
        if (!groupedData[item.venue]) {
            groupedData[item.venue] = [];
        }
        groupedData[item.venue].push(item);
    });
    return Object.values(groupedData);
}

// Function to create a table for each Venue
function createVenueTable(venueGroup) {
    const venueTable = document.createElement('table');

    // Create table header row
    const headerRow = venueTable.insertRow();
    for (const key in venueGroup[0]) {
        if (venueGroup[0].hasOwnProperty(key)) {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        }
    }

    // Create table rows for each Date
    venueGroup.forEach(item => {
        const row = venueTable.insertRow();
        for (const key in item) {
            if (item.hasOwnProperty(key)) {
                const cell = row.insertCell();
                cell.textContent = item[key];
            }
        }
    });

    return venueTable;
}

fetchDataWithBearerToken()
    .then(data => {
        console.log(data);
        createTable(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
