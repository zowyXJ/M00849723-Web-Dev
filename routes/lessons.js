const express = require('express');
const { ObjectId } = require('mongodb'); // For working with MongoDB Object IDs
const router = express.Router();

// Get all lessons
router.get('/', async (req, res) => {
    console.log('Fetching all lessons...');
    const db = req.app.locals.db; // Access db from app.locals
    if (!db) {
        console.error('Database connection is not available');
        return res.status(500).send('Database connection is not available');
    }

    try {
        const lessons = await db.collection('lessons').find({}).toArray();
        console.log('Lessons fetched:', lessons);
        res.json(lessons);
    } catch (err) {
        console.error('Error fetching lessons:', err);
        res.status(500).send('Error fetching lessons');
    }
});

// Create a new lesson (POST)
// Create a new lesson (POST)
router.post('/', async (req, res) => {
    const { title, Price, spaces } = req.body;
    const db = req.app.locals.db; // Access db from app.locals

    console.log('Creating a new lesson with data:', req.body);

    if (!db) {
        console.error('Database connection is not available');
        return res.status(500).send('Database connection is not available');
    }

    try {
        const lesson = {
            title,
            Price,
            spaces,
            createdAt: new Date(),
        };

        const result = await db.collection('lessons').insertOne(lesson);
        console.log('Lesson created successfully with ID:', result.insertedId);

        // Respond with the newly created lesson details
        res.status(201).json({
            _id: result.insertedId,
            ...lesson,
        });
    } catch (err) {
        console.error('Error creating lesson:', err);
        res.status(500).send('Error creating lesson');
    }
});


// Delete a lesson by ID (DELETE)
router.delete('/:id', async (req, res) => {
    const lessonId = req.params.id;
    const db = req.app.locals.db; // Access db from app.locals

    console.log(`Deleting lesson with ID: ${lessonId}`);

    if (!db) {
        console.error('Database connection is not available');
        return res.status(500).send('Database connection is not available');
    }

    try {
        const result = await db.collection('lessons').deleteOne({ _id: new ObjectId(lessonId) });

        if (result.deletedCount === 0) {
            console.warn(`No lesson found with ID: ${lessonId}`);
            return res.status(404).send('Lesson not found');
        }

        console.log('Lesson deleted successfully:', result);
        res.status(200).send('Lesson deleted successfully');
    } catch (err) {
        console.error('Error deleting lesson:', err);
        res.status(500).send('Error deleting lesson');
    }
});

// Update lesson spaces (PUT)
router.put('/:id', async (req, res) => {
    const lessonId = req.params.id;
    const { spaces } = req.body;
    const db = req.app.locals.db; // Access db from app.locals

    console.log(`Updating lesson with ID: ${lessonId} to have ${spaces} spaces.`);

    if (!db) {
        console.error('Database connection is not available');
        return res.status(500).send('Database connection is not available');
    }

    try {
        const result = await db.collection('lessons').updateOne(
            { _id: new ObjectId(lessonId) },
            { $set: { spaces } }
        );

        if (result.matchedCount === 0) {
            console.warn(`No lesson found with ID: ${lessonId}`);
            return res.status(404).send('Lesson not found');
        }

        console.log('Update result:', result);
        res.json(result);
    } catch (err) {
        console.error('Error updating lesson spaces:', err);
        res.status(500).send('Error updating lesson spaces');
    }
});

module.exports = router;
