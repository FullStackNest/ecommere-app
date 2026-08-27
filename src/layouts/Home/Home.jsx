import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { DB } from "../../firebase.config";




const Home = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const productsRef = collection(DB, "products");

    const q = query(
      productsRef,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {

        const productsList = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data()
          })
        );

        setProducts(productsList);
        setLoading(false);
      },
      (error) => {

        console.error(
          "Error fetching products:",
          error
        );

        setLoading(false);
      }
    );

    // Cleanup listener
    return () => unsubscribe();

  }, []);


  if (loading) {
    return (
      <div className="loading">
        Loading products...
      </div>
    );
  }

  const formatPrice = (price) => {
    return Number(price).toLocaleString("en-IN");
  };


  return (
    <div className="container-fluid">

      <div className="row mt-3">

        {products.map((product) => (

          <div
            className="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12"
            key={product.id}
          >

            <div className="card">
              <img src={product.urlLink} className="card-img-top" alt={product.productName} />
              <div className="card-body">
                <p>{product.productName}</p>

                <p className="card-text">MRP: <span style={{ textDecoration: "lineThrough" }}>₹&nbsp;{formatPrice(product.mrpAmount)}</span></p>
                <p className="card-text">Get at: ₹&nbsp; {formatPrice(product.sellingPrice)}</p>
                <button onClick={() =>
                  window.open(
                    product.urlLink,
                    "_blank"
                  )
                } className="btn btn-primary">view</button>
              </div>
            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default Home;