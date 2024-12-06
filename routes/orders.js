const express = require('express');
const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
    const { name, phone, lessonIds } = req.body;
    const db = req.app.locals.db; // Access the database from app.locals

    console.info(new Date(), 'Received request to create order:', req.body);

    // Check if the database is available
    if (!db) {
        console.error(new Date(), 'Database connection is not available');
        return res.status(500).json({ error: 'Database connection is not available' });
    }

    // Validate request body
    if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
        console.warn(new Date(), 'Invalid lesson IDs in request:', lessonIds);
        return res.status(400).json({ error: 'Lesson IDs are required and must be a non-empty array' });
    }

    try {
        // Optionally validate lessonIds, check that they exist in the database
        const lessons = await db.collection('lessons').find({ _id: { $in: lessonIds } }).toArray();
        
        // Create the order document with the original lessonIds array
        const order = {
            name,
            phone,
            lessonIds, // Store the lessonIds as an array (no need to stringify)
            createdAt: new Date(),
        };

        console.debug(new Date(), 'Creating order with data:', order);

        // Insert the new order into the 'orders' collection
        const result = await db.collection('orders').insertOne(order);

        console.info(new Date(), 'Order created successfully:', result);

        res.status(201).json({
            message: 'Order created successfully',
            order: {
                orderId: result.insertedId,
                name,
                phone,
                lessonIds, // Return original array format
                createdAt: order.createdAt,
            },
        });
    } catch (err) {
        console.error(new Date(), 'Error creating order:', err);
        res.status(500).json({ error: 'Error creating order' });
    }
});

// Fetch all orders
router.get('/', async (req, res) => {
    console.info(new Date(), 'Fetching all orders...');
    const db = req.app.locals.db;

    if (!db) {
        console.error(new Date(), 'Database connection is not available');
        return res.status(500).json({ error: 'Database connection is not available' });
    }

    try {
        const orders = await db.collection('orders').find({}).toArray();
        console.debug(new Date(), 'Orders fetched from database:', orders);

        // Return orders with the lessonIds as an array (no need to parse)
        const formattedOrders = orders.map((order) => ({
            ...order,
            lessonIds: order.lessonIds, 
        }));

        console.info(new Date(), 'Orders sent to client:', formattedOrders);

        res.json(formattedOrders);
    } catch (err) {
        console.error(new Date(), 'Error fetching orders:', err);
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

// Update an existing order
router.put('/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { name, phone, lessonIds } = req.body;
    const db = req.app.locals.db; 

    console.info(new Date(), `Received request to update order with ID: ${orderId}`);

    // Check if the database is available
    if (!db) {
        console.error(new Date(), 'Database connection is not available');
        return res.status(500).json({ error: 'Database connection is not available' });
    }

    // Validate request body
    if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
        console.warn(new Date(), 'Invalid lesson IDs in request:', lessonIds);
        return res.status(400).json({ error: 'Lesson IDs are required and must be a non-empty array' });
    }

    try {
        // Optionally validate lessonIds, check that they exist in the database
        const lessons = await db.collection('lessons').find({ _id: { $in: lessonIds } }).toArray();
        
        if (lessons.length !== lessonIds.length) {
            console.warn(new Date(), 'One or more lesson IDs are invalid:', lessonIds);
            return res.status(400).json({ error: 'One or more lesson IDs are invalid' });
        }

        // Update the order in the database
        const result = await db.collection('orders').updateOne(
            { _id: orderId }, 
            {
                $set: {
                    name,
                    phone,
                    lessonIds, 
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            console.warn(new Date(), 'Order not found with ID:', orderId);
            return res.status(404).json({ error: 'Order not found' });
        }

        console.info(new Date(), 'Order updated successfully:', result);

        res.status(200).json({
            message: 'Order updated successfully',
            order: {
                orderId,
                name,
                phone,
                lessonIds,
                updatedAt: new Date(),
            },
        });
    } catch (err) {
        console.error(new Date(), 'Error updating order:', err);
        res.status(500).json({ error: 'Error updating order' });
    }
});

module.exports = router;
