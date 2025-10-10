const express = require("express");
const Quest = require("../models/quest");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware.js");

const router = express.Router();

// Create quest (admin only for now)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ msg: "Not authorized" });

    const quest = new Quest(req.body);
    await quest.save();
    res.json(quest);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Public: get all quests
router.get("/", authMiddleware, async (req, res) => {
  const quests = await Quest.find();
  res.json(quests);
});

//get one quest
router.get("/:id", async(req,res)=>{
  try{
    const quest = Quest.findById(
      req.params.id
    )

    if(!quest) return res.status(404).json({error: "Quest not found"})
    
      res.json(quest);
  } catch (err){
    res.status(500).json({error: "Server Error"});
  }
});

//Update quests
router.put("/:id", authMiddleware, adminMiddleware, async(req, res)=>{
  try{
     const updatedQuest = await Quest.findByIdAndUpdate(
    req.params.id,
    req.body,
    {new : true}
  );

  if(!updatedQuest) return res.status(404).json({ error: "Quest not found"});

  res.json(updatedQuest);
  } catch (err){
    res.status(400).json({error: err.message});
  }
 
})

//delete a quest
router.delete("/:id", authMiddleware, adminMiddleware, async (req,res)=>{
  try{
    const quest = Quest.findByIdAndDelete(
      req.params.id
    );

    if(!quest) return res.status(404).json({error: "Quest not found"});

    res.json({msg : "Quest Deleted"});
  } catch(err){
    res.status(500).json({error: "Server error"});
  }
})

module.exports = router;
