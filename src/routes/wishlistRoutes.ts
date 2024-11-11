import { AppDataSource } from "../database";
import express from "express";
import { User } from "../entity/User";
import { Like } from "typeorm";
import { Wishlist } from "../entity/Wishlist";
import { Property } from "../entity/Property";
import { getProperty } from "./propertyRoutes";
import { getUser } from "./userRoutes";

const wishlistRouter = express.Router({ strict: true });

export async function addWishlist(
    userId: string,
    propertyId: string,
    folderName: string,
  ) {
    const user = await getUser(userId)
    const property = await getProperty(propertyId)
    if(user===null || property===null){
        return null
    }

    let wishlist = new Wishlist();
    wishlist.folderName = folderName
    wishlist.userId = userId
    wishlist.propertyId = propertyId
    const res = await AppDataSource.manager.save(wishlist);
    return res
}
  
  export async function removeWishlist(
    userId: string,
    propertyId: string,
    folderName: string,
  ) {
    const res = await AppDataSource.manager.delete(Wishlist, { userId: userId, propertyId: propertyId, folderName: folderName })
    return res;
}
  
export async function getWishlists(
    userId: string
) {
    const res = await AppDataSource.manager.find(Wishlist, { where:{ userId: userId } })
    return res;
}

export async function getWishlistsFolderName(
    userId: string
) {
    const res = await AppDataSource.manager.createQueryBuilder(Wishlist, "W").select("W.folderName").where("W.userId = :userId", { userId: userId }).distinct(true).getMany()
    return res;
}

export async function getAllWishlists() {
    const res = await AppDataSource.manager.find(Wishlist)
    return res;
}

wishlistRouter.get("/", async (req, res) => {
    res.json(await getAllWishlists());
});

wishlistRouter.get("/:userId", async (req, res) => {
    const userId = req.params.userId
    const result = await getWishlists(userId)
    const folderNames = await getWishlistsFolderName(userId)

    //Initialisation
    let favorites: { [name: string]: [Property?]} = {}
    for(const w of folderNames){
        let name = w.folderName
        favorites[name] = []
    }

    for(const row of result){
        let folderName = row.folderName
        let property = await getProperty(row.propertyId)
        if(property === null){
            continue
        }
        property.id = property.id.toUpperCase()
        favorites[folderName].push(property)
    }
    res.json(favorites);
});

wishlistRouter.post("/", async (req, res) => {
    const { userId, propertyId, folderName } = req.body;
    const wishlist = await addWishlist(userId, propertyId, folderName);

    if (wishlist) res.json(wishlist);
    else res.status(500).send({"message": "Something bad happened. Either no property or no user, or both"});
});

wishlistRouter.delete("/", async (req, res) => {
    const { userId, propertyId, folderName } = req.body;
    const wishlist = await removeWishlist(userId, propertyId, folderName);

    if (wishlist) res.json(wishlist);
    else res.status(500).send({"message": "Something bad happened"});
});

export default wishlistRouter