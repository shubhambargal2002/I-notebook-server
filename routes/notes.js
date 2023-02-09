const express = require("express");
const router = express.Router();
const Note = require("../models/noteSchema");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

// Route-1: get all the notes using: GET "/fetchallnotes"  login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
      const notes = await Note.find({ user: req.user.id });
      res.json(notes);
    } catch (error) {
      console.error(error.message);
      res.status(400).send("Internal server error");
    }
  });

  // Route-2: add a new note using: POST "/addnote"  login required
router.post(
    "/addnote",
    fetchuser,
    [
      body("title", "Enter a valid name").isLength({ min: 3 }),
      body("description", "Description must be atleast 5 characters").isLength({
        min: 5,
      }),
    ],
    async (req, res) => {
      try {
        const { title, description, tag } = req.body;
        // if there are error, return bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        const note = new Note({
          title,
          description,
          tag,
          user: req.user.id,
        });
        const savednote = await note.save();
        res.json(savednote);
      } catch (error) {
        console.error(error.message);
        res.status(400).send("Internal server error");
      }
    }
  );

// Route-3: update an existing note using: PUT "/updatenote"  login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
      // create a new note object
      const newNote = {};
      if (title) {
        newNote.title = title;
      }
      if (description) {
        newNote.description = description;
      }
      if (tag) {
        newNote.tag = tag;
      }
  
      // find a note to be updated and update it
      let note = await Note.findById(req.params.id);
      if (!note) {
        return res.status(404).send("Not Found");
      }
      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
      }
      note = await Note.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      );
      res.json({ note });
    } catch (error) {
      console.error(error.message);
      res.status(400).send("Internal server error");
    }
  });

// Route-4: delete an existing note using: DELETE "/deletenote"  login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
      // find a note to be deleted and delete it
      let note = await Note.findById(req.params.id);
      if (!note) {
        return res.status(404).send("Not Found");
      }
      // Allow deletion only if user owns this note
      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
      }
      note = await Note.findByIdAndDelete(req.params.id);
      res.json({ Success: "Note has been deleted", note: note });
    } catch (error) {
      console.error(error.message);
      res.status(400).send("Internal server error");
    }
  });

module.exports = router;