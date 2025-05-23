const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const Contact = require("../models/contact.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//NEw listing Route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listing/new.ejs");
});

//Post request for adding new listing
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,

  wrapAsync(async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  })
);

router.get("/mylistings", isLoggedIn, async (req, res) => {
  let id = req.user._id;
  console.log(id);
  const listingData = await Listing.find({ owner: id });
  res.render("listing/myListings.ejs", { listingData });
});

// Show all contact queries
router.get(
  "/contacts",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const userId = req.user._id;
    // Get contacts where current user is either the requester or the owner
    const contacts = await Contact.find({
      $or: [{ requester: userId }, { owner: userId }],
    })
      .populate("listing")
      .populate("owner")
      .populate("requester")
      .sort({ createdAt: -1 }); // Sort by newest first

    res.render("listing/contacts.ejs", { contacts });
  })
);

// Index route

router.get(
  "/",
  wrapAsync(async (req, res) => {
    let { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { street: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const listingData = await Listing.find(query);
    res.render("listing/index", { listingData, query: req.query });
  })
);

//show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let data = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");

    if (!data) {
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listings");
    }
    res.render("listing/show.ejs", { data });
  })
);

//Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listings");
    }
    res.render("listing/edit.ejs", { listing });
  })
);

//update route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
      await listing.save();
    }
    req.flash("success", "Listing Updated!");

    res.redirect(`/listings/${id}`);
  })
);

//Delete route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndDelete(id);
    console.log(listing);
    req.flash("success", " Listing Deleted!");

    res.redirect("/listings");
  })
);

// Contact owner route
router.post(
  "/:id/contact",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    const contact = new Contact({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      message: req.body.message,
      listing: id,
      owner: listing.owner._id,
      requester: req.user._id,
    });

    await contact.save();
    req.flash("success", "Contact request sent successfully!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
