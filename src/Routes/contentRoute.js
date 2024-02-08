const Router = require("express");
const contentRouter = Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const contentData = require("../Modal/contentModal");


const destinationDirectory = "files";
if (!fs.existsSync(destinationDirectory)) {
  fs.mkdirSync(destinationDirectory);
}
const filestorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files");
  },
  filename: function (req, file, cb) {
    const timeStamp = new Date().toISOString().replace(/:/g, "-");
    cb(null, `${timeStamp}_${file.originalname}`);
  },
});
const upload = multer({ storage: filestorage });

contentRouter.get("/", async (req, res) => {
  try {
    const allContentData = await contentData.find({});
    if (!allContentData || allContentData.length <= 0) {
      return res.status(404).send({ message: "data not found" });
    }
    return res.status(200).send(allContentData);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Error fetching data from database", error });
  }
});

contentRouter.post("/content", upload.single("file"), (req, res) => {
  try {
    // console.log(req.file)
    const { title, description } = req.body;
    const file = req.file;
    let mimeType = file.mimetype;
    console.log("file", mimeType);
    const saveData = new contentData({
      title,
      description,
      file: {
        name: path.join("files", req.file.filename).replace(/\\/g, "/"),
        mimeType: mimeType,
      },
    });
    saveData.save();
    console.log(saveData);

    return res
      .status(200)
      .send({ message: "Data saved to database successfully!", saveData });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Error saving file data to database", error });
  }
});

contentRouter.get("/file/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const file = await contentData.findById(id);

    if (!file || file.length <= 0) {
      return res.status(404).send({ message: "File not found" });
    }

    const filePath = path.join(__dirname, "..", "..", file.file.name);
    const originalFileName = file.title;

    console.log(file.file.mimeType);
    res.setHeader("Content-Type", file.file.mimeType);
    let extension = file.file.mimeType.split("/").pop();
    let fileExtension = `${originalFileName}.${extension}`;
    console.log(fileExtension)
    return res.download(filePath, fileExtension);
  } catch (error) {
    return res.status(500).send({ message: "file can't download", error });
  }
});
contentRouter.get("/preview/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const file = await contentData.findById(id);

    if (!file || file.length <= 0) {
      return res.status(404).send({ message: "File not found" });
    }

    if (isSupportedFileType(file.file.mimeType)) {
      const filePath = file.file.name;
      const reader = fs.createReadStream(filePath);
      // console.log(reader)
      reader.pipe(res);
    } else {
      return res
        .status(400)
        .send({ message: "File type not supported for preview" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Error previewing file", error });
  }
});

function isSupportedFileType(miniType) {
  console.log("filePath", miniType);
  const supportedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/plain",
    "text/csv",
    "application/pdf",
    "application/vnd.ms-excel",
    "application/msword",
  ];
  return supportedTypes.includes(miniType);
}
module.exports = contentRouter;
