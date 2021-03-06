import express from 'express';
import { Category, categoryArray } from '../models/CategoryObject';
import { User } from '../models/userObj';
import { JWTAuthorization } from '../utils/jwtAuth';


const catRouter = express.Router();

// DELETE ROUTES
catRouter.delete("/:categoryId", (req,res,next) =>{
  let currUser = JWTAuthorization.ValidateToken(req.headers);
  if(currUser instanceof User){
    //once verified get the category that needs to be deleted 
    let onDeleteCategory = categoryArray.filter(currCategory => currCategory.categoryId===parseInt(req.params.categoryId));
    if(onDeleteCategory.length>0){ 
      if(onDeleteCategory[0].categoryId === parseInt(req.params.categoryId)){
        const catIDX = categoryArray.findIndex(category => category.categoryId === parseInt(req.params.categoryId))
        categoryArray.splice(catIDX, 1)
        res.status(204).send({message: 'Deleted'});
      }else{
        res.status(404).send({message:`Category: ${req.params.categoryId} does not exist!`});
      }
    }else{
      res.status(401).send({message: 'There are no categories to show!'});
    }
  }else{
    res.status(401).send({message: 'NOT AUTHORIZED. YOU ARE NOT WORTHY ENOUGH TO DELETE THIS CATEGORY.'});
  }
});

// category ROUTES
catRouter.post("/", (req, res, next) => {
  // Check that Token 
  let currUser = JWTAuthorization.ValidateToken(req.headers);
  if(currUser instanceof User){
    //check that REQ for the right stuffff if(title or content not present )
    if(!req.body.categoryName|| !req.body.categoryDescription){
      res.status(406).send({message:"Check yourself,fool. Categories need a NAME and DESCRIPTIOn."});
    }else{
      //definitely took this from your lecture --> giving credit where it's due
      var onCat = new Category(categoryArray.length==0?1:Math.max.apply(Math,categoryArray.map((someCat)=>{return someCat.categoryId; }))+1, req.body.categoryName, req.body.categoryDescription);
      categoryArray[categoryArray.length]=onCat;//push to array
      res.status(200).send(onCat); 
    } 
  }else{
    res.status(401).send({message:"No way, Jose. You are not authorized! Try again with a correct bearer token! "});
  }
});

// ALL PATCH REQUEST
catRouter.patch("/:categoryId", (req, res, next) => {
  let currUser = JWTAuthorization.ValidateToken(req.headers); // Check for Authorized User 
  if(currUser instanceof User){
    let currentCategory = categoryArray.filter(currCategory => currCategory.categoryId===+req.params.categoryId);
    if(currentCategory.length>0){
      if(currentCategory[0].categoryId===req.body.categoryId){
        if(req.body.categoryName){
          currentCategory[0].categoryName = req.body.categoryName;
        }
        if(req.body.categoryDescription){
          currentCategory[0].categoryDescription = req.body.categoryDescription;
        }
        res.status(200).send(currentCategory[0]);
      }else{
        // Wrong User Trying To Do Funky Stuff 
        res.status(401).send({message: `Unauthorized Access, Request Denied for USER: ${currUser.userId}. Please note only the original Category creator can make desired changes.`});
      }
    }else{
      // Post Not Found
      res.status(404).send({message:`Category: ${req.params.categoryId} cannot be located, pleaset try using a different categoryId.`})
    }
  }else{
    // Not Authorized 
    res.status(401).send({message:"Get yourself a TOKEN. NOT AUTHORIZED FOOL "})
  }
})

// ALL GET REQUEST
catRouter.get("/:categoryId", (req, res, next) => {
  // locate Cat
  let category = categoryArray.filter(currCategory => currCategory.categoryId===+req.params.categoryId);
  if(category.length>0){
    res.status(200).send(category[0]);
  }else{
    res.status(404).send({message:`Category: ${req.params.categoryId} not found`});
  }
});

catRouter.get("/", (req, res, next) => {
  // get all categories --> No need to authenticate 
  res.status(200).send(categoryArray);
});

export { catRouter };