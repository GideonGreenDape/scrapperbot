const express = require('express');
const axios = require('axios');
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Function to fetch listings for a specific page
const fetchListings = async (page) => {
    const url = `https://www.rentfaster.ca/ab/calgary/rentals/?l=10,51.0061,-114.0331&page=${page}`;

    try {
        const response = await axios.get(url);
        const htmlContent = response.data;

        const listingsRegex = /var preloadedListings = (\[.*?\]);/;
        const match = htmlContent.match(listingsRegex);

        if (match && match[1]) {
            const preloadedListings = JSON.parse(match[1]);
            return preloadedListings;
        } else {
            console.log("preloadedListings not found in the response");
            return [];
        }
    } catch (error) {
        console.error(error);
        return [];
    }
};

// Function to extract relevant data from each listing
const extractListingData = (listing) => {
    return {
        id: listing.id || "N/A",
        phone: listing.phone || "N/A",
        availability: listing.availability || "N/A",
        intro: listing.intro || "N/A",
        address: listing.address || "N/A",
        community: listing.community || "N/A",
        type: listing.type || "N/A",
        price: listing.price || "N/A",
        price2: listing.price2 || "N/A",
        baths: listing.baths || "N/A",
        baths2: listing.baths2 || "N/A",
        sq_feet: listing.sq_feet || "N/A",
        sq_feet2: listing.sq_feet2 || "N/A",
        cats: listing.cats || "N/A",
        dogs: listing.dogs || "N/A",
        utilities_included: listing.utilities_included ? listing.utilities_included.join(", ") : "N/A",
        beds: listing.beds || "N/A",
        beds2: listing.beds2 || "N/A"
    };
};

// Function to fetch listings from multiple pages
const loadAllListings = async (maxPages = 20) => {
    let allListings = [];

    for (let page = 1; page <= maxPages; page++) {
        const listings = await fetchListings(page);
        allListings = allListings.concat(listings);
        
    }

    // Filter the data to only extract relevant fields
    const formattedListings = allListings.map(extractListingData);
    return formattedListings;
};

// Route to get all listings
app.get('/listings', async (req, res) => {
    try {
        const listings = await loadAllListings();
        res.json(listings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
