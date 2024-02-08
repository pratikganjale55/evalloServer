const mongoose = require("mongoose");

const contentSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  file: {
    name: { type: String, required: true },
    mimeType: { type: String, required: true }
  }
});

const contentModal = mongoose.model("contentModal", contentSchema);

module.exports = contentModal;
