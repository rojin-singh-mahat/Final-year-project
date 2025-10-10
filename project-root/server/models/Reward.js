const RewardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    pointsRequired: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    icon: {
      type: String,
    }, // could be URL or filename
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", RewardSchema);
