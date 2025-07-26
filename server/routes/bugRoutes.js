import express from "express"
import {createBug,getBugs} from "../controllers/bugController.js"

const router = express.Router();

router.post('/',createBug);
router.get('/',getBugs);

export default router
