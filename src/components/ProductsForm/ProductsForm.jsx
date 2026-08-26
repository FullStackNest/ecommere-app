import React from 'react'
import { CATEGORIES } from '../../utils/constants'




const ProductsForm = () => {



    return (
        <div className='container'>
            <h2>Product Upload Form</h2>
            <form className='row'>
                <div className="mb-3 col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12">
                    <label for="productName" className="form-label">Product Name</label>
                    <input type="text" placeholder='Enter product name' className="form-control" id="productName" />
                </div>
                <div className="mb-3 col-xl-8 col-lg-8 col-md-6 col-sm-12 col-12">
                    <label for="urlLink" className="form-label">URL Link</label>
                    <input type="url" placeholder="Enter product image link" className="form-control" id="urlLink" />
                </div>
                <div className="mb-3 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                    <label for="urlLink" className="form-label">Description</label>
                    <textarea rows={5} type="url" placeholder="Write about product details" className="form-control" id="urlLink" >
                    </textarea>
                </div>
                <div className="mb-3 col-xl-3 col-lg-3 col-md-4 col-sm-12 col-12">
                    <label for="category" className="form-label">Category</label>
                    <select className='form-control' name="" id="">
                        <option value="">Choose category</option>
                        {CATEGORIES.map((item, i) => (
                            <option key={i} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
                <div className=" mb-3 col-xl-3 col-lg-3 col-md-4 col-sm-12 col-12">
                    <label for="urlLink" className="form-label">MRP</label>
                    <div className="input-group">
                        <span class="input-group-text">₹</span>
                        <input type="url" placeholder='Amount in Rupees (INR)' className="form-control" id="urlLink" />
                    </div>

                </div>
                <div className="mb-3 col-xl-3 col-lg-3 col-md-4 col-sm-12 col-12">
                    <label for="discount" className="form-label">Discount</label>
                    <input type="url" className="form-control" id="discount" />

                </div>
                <div className="mb-3 col-xl-3 col-lg-3 col-md-4 col-sm-12 col-12">
                    <label for="discount" className="form-label">Selling Price</label>
                    <div className="input-group">
                        <span class="input-group-text">₹</span>
                        <input type="text" disabled readOnly className="form-control" id="discount" />
                    </div>

                </div>



                <div className="col-4">
                    <button type="submit" className="btn btn-primary">Submit</button>
                </div>
            </form>
        </div>
    )
}

export default ProductsForm