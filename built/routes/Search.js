import express from "express";
import db from "../db.js";
// Create a new express router object
const router = express.Router();
router.get("/", (req, res) => {
    const location_id = req.query["select"];
    const search_input = req.query["search_input"];
    // in case an empty input field is given, return all items in with the given location_id
    if (search_input === "") {
        const items = db
            .prepare("SELECT * FROM items WHERE location_id = ?")
            .all(location_id);
        res.json(items);
        return;
    }
    else {
        // let us collect all search words typed into the input field in the frontend and store them in array
        const searchWords = [];
        // add search words one by one to searchWords in the format required for our sql statement
        search_input.split(" ").forEach((word) => {
            searchWords.push(`%${word}%`);
        });
        // lets prepare the sql statement
        let sqlStatement = "SELECT * FROM items WHERE location_id = ? AND (";
        for (let i = 0; i < searchWords.length; i++) {
            sqlStatement += "name LIKE ? OR freeText LIKE ?";
            if (i !== searchWords.length - 1) {
                sqlStatement += " OR ";
            }
            else {
            }
        }
        // remember to close the parantheses
        sqlStatement += ")";
        // we need a placeholder for each argument that we want to use for our sql statement
        const placeholder = [location_id];
        // now that we have a placeholder for our arguments for our sql statement,
        // lets iterate through searchWords and occupy the empty placeholder array
        searchWords.forEach((word) => placeholder.push(word, word));
        // now we are ready to execute our sql statement
        const stmt = db.prepare(sqlStatement);
        const items = stmt.all(...placeholder);
        res.json(items);
        return;
    }
});
export default router;
