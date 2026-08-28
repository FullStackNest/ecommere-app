import { useEffect, useState } from 'react'
import { CATEGORIES } from '../../utils/constants'
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { DB } from "../../firebase.config";
import EnhancedTable from '../ProductsTable/ProductsTable';




const ProductsForm = () => {
    const [itemsData, setItemsData] = useState({
        productName: '',
        urlLink: '',
        description: '',
        category: '',
        mrpAmount: '',
        discount: '',
        sellingPrice: '',

    })
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleDiscount = (mrp, discount) => {
        return Number(mrp) - Number(mrp) * (Number(discount) / 100);
    };


    const handleFormInputs = (e) => {
        const { name, value } = e.target;

        setItemsData(prev => {
            const updatedData = {
                ...prev,
                [name]: value
            };

            // Calculate selling price when MRP or discount changes
            if (name === "mrpAmount" || name === "discount") {
                updatedData.sellingPrice = handleDiscount(
                    name === "mrpAmount" ? value : prev.mrpAmount,
                    name === "discount" ? value : prev.discount
                );
            }

            return updatedData;
        });
    }

    // --------------------------------
    // Load Existing Products
    // --------------------------------
    const fetchProducts = async () => {

        try {

            const productsRef = collection(
                DB,
                "products"
            );

            const q = query(
                productsRef,
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(q);

            const productsList = snapshot.docs.map(
                (doc) => ({
                    id: doc.id,
                    ...doc.data()
                })
            );

            console.log(productsList);


            setProducts(productsList);

        } catch (error) {

            console.error(
                "Error fetching products:",
                error
            );

        }

    };


    // --------------------------------
    // Fetch Products When Component Loads
    // --------------------------------
    useEffect(() => {

        fetchProducts();

    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {

            // Prepare data
            const productData = {

                ...itemsData,

                mrpAmount: Number(
                    itemsData.mrpAmount
                ),

                discount: Number(
                    itemsData.discount
                ),

                sellingPrice: Number(
                    itemsData.sellingPrice
                ),

                createdAt: serverTimestamp()

            };


            // Add document to Firestore
            const docRef = await addDoc(
                collection(DB, "products"),
                productData
            );


            // --------------------------------
            // Capture newly added document
            // --------------------------------

            const newProduct = {

                id: docRef.id,

                ...productData,

                // serverTimestamp() is not immediately
                // available as a normal JS Date.
                // We only need it for table ordering
                // here, so give it the current time.
                createdAt: new Date()

            };


            // --------------------------------
            // Put newest product at TOP
            // --------------------------------

            setProducts((prevProducts) => [
                newProduct,
                ...prevProducts
            ]);


            // Reset form
            setItemsData({
                productName: "",
                urlLink: "",
                description: "",
                category: "",
                mrpAmount: '',
                discount: '',
                sellingPrice: '',
            });


            console.log(
                "Product added:",
                newProduct
            );


        } catch (error) {

            console.error(
                "Error adding product:",
                error
            );

        } finally {

            setLoading(false);

        }

    }


    return (
        <div className='container'>
            <h2>Product Upload Form</h2>
            <form onSubmit={handleFormSubmit} className='row'>
                <div className="mb-3 col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12">
                    <label htmlFor="productName" className="form-label">Product Name</label>
                    <input onChange={handleFormInputs} type="text" placeholder='Enter product name' className="form-control" value={itemsData.productName} name="productName" />
                </div>
                <div className="mb-3 col-xl-8 col-lg-8 col-md-6 col-sm-12 col-12">
                    <label htmlFor="urlLink" className="form-label">URL Link</label>
                    <input type="url" placeholder="Enter product image link" className="form-control" onChange={handleFormInputs} value={itemsData.urlLink} name="urlLink" />
                </div>
                <div className="mb-3 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea rows={5} placeholder="Write about product details" name="description" onChange={handleFormInputs} value={itemsData.description} className="form-control"  >
                    </textarea>
                </div>
                <div className="mb-3 col-xl-3 col-lg-3 col-md-4 col-sm-12 col-12">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select className='form-control' onChange={handleFormInputs} name="category">
                        <option value="">Choose category</option>
                        {CATEGORIES.map((item, i) => (
                            <option key={i} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
                <div className=" mb-3 col-xl-3 col-lg-3 col-md-4 col-sm-12 col-12">
                    <label htmlFor="mrpAmount" className="form-label">MRP</label>
                    <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input onChange={handleFormInputs} name='mrpAmount' placeholder='Amount in Rupees (INR)' value={itemsData.mrpAmount} className="form-control" />
                    </div>

                </div>
                <div className="mb-3 col-xl-3 col-lg-3 col-md-4 col-sm-12 col-12">
                    <label htmlFor="discount" className="form-label">Discount</label>
                    <input className="form-control" value={itemsData.discount} onChange={handleFormInputs} name="discount" />

                </div>
                <div className="mb-3 col-xl-3 col-lg-3 col-md-4 col-sm-12 col-12">
                    <label htmlFor="sellingPrice" className="form-label">Selling Price</label>
                    <div className="input-group">
                        <span class="input-group-text">₹</span>
                        <input onChange={handleFormInputs} type="text" readOnly className="form-control" name="sellingPrice" value={itemsData.sellingPrice} />
                    </div>

                </div>



                <div className="col-4">
                    <button type="submit" className="btn btn-primary">Submit</button>
                </div>
            </form>



            <table
                border="1"
                cellPadding="10"
                style={{
                    width: "100%",
                    marginTop: "30px",
                    borderCollapse: "collapse"
                }}
            >

                <thead>

                    <tr>

                        <th>SL</th>

                        <th>Product Name</th>

                        <th>Category</th>

                        <th>MRP</th>

                        <th>Discount</th>

                        <th>Selling Price</th>

                        <th>URL</th>

                    </tr>

                </thead>


                <tbody>

                    {products.length === 0 ? (

                        <tr>

                            <td
                                colSpan="7"
                                style={{
                                    textAlign: "center"
                                }}
                            >
                                No Products Found
                            </td>

                        </tr>

                    ) : (

                        products.map(
                            (product, index) => (

                                <tr key={product.id}>

                                    <td>
                                        {index + 1}
                                    </td>

                                    <td>
                                        {product.productName}
                                    </td>

                                    <td>
                                        {product.category}
                                    </td>

                                    <td>
                                        ₹{product.mrpAmount}
                                    </td>

                                    <td>
                                        {product.discount}%
                                    </td>

                                    <td>
                                        ₹{product.sellingPrice}
                                    </td>

                                    <td>

                                        <a
                                            href={product.urlLink}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <img src={product.urlLink} style={{ height: "50px", width: "50px", objectFit: "cover" }} />
                                        </a>

                                    </td>

                                </tr>

                            )
                        )

                    )}

                </tbody>

            </table>

            <EnhancedTable />
        </div>
    )
}

export default ProductsForm