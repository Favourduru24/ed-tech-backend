const Category = require('../models/Category')
   
   const createCategory = async (req, res, next) => {
      try {
           const {name} = req.body
         
          if(!name) {
             return res.status(400).json({message: 'Place a category name'})
          }

          const category = await Category.create({name})

           if(!category) {
             return res.json({message: 'Something went wrong creating category!'})
           }

           res.json({message: 'Category created successfully!', category})

      } catch(error) {
         next(error)
         console.log('Error in createCategory')
         return res.status(500).json({message: 'Something went wrong!'}) 
      }
   }

   const getAllCategory = async (req, res) => {
      try {
    
        const allCategory = await Category.find()

      if(!allCategory?.length) {
         return res.status(400).json({message: 'No Category Found!'})
      }

        res.json({allCategory})

      } catch(error){
             console.log('Error fetching category', error)
      }
     
   }

module.exports = {createCategory, getAllCategory}