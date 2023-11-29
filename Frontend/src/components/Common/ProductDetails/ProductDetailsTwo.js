import ProductInfo from './ProductInfo'
import RelatedProduct from './RelatedProduct'
import { useState, useEffect } from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from 'react-router-dom';
import { RatingStar } from "rating-star";
import { addFavouriteAsync, getProductByIdAsync, updateCartAsync } from '../../../app/slices/product';

const ProductDetailsTwo = () => {
    let { id } = useParams();
    let dispatch = useDispatch();

    const { single, status, error } = useSelector((state) => state.products);
    const [product, setProduct] = useState(null);

    useEffect(() => {
        // Ensure that this is only dispatched once when the component mounts
        dispatch(getProductByIdAsync(id));
    }, [dispatch]); 
    
    useEffect(()=>{
        setProduct(single);
    }, [single])

    // Quenty Inc Dec
    const [count, setCount] = useState(1)

    const incNum = () => {
        setCount(count + 1)
    }
    const decNum = () => {
    if (count > 0) {
        setCount(count - 1)
        } else {
        alert("Stokta Yok!")
        setCount(0)
        }
    }

    // Add to cart
    const addToCart = async (product) => {
        dispatch(updateCartAsync({product: product, quantity: count}))
    }

    // Add to Favorite
    const addToFav = async (productId) => {
        dispatch(addFavouriteAsync(productId))
    }

 
    

    let settings = {
        arrows: true,
        dots: true,
        infinite: true,
        speed: 500,
        fade: true,
        autoplay: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };
    return (
        <>
        {status !== 'succeeded' ? (
                <div>Loading...</div>
            ) :
            (product && <section id="product_single_two" className="ptb-100">
                <div className="container">
                    <div className="row area_boxed">
                        <div className="col-lg-4">
                            <div className="product_single_two_img slider-for">
                                <Slider {...settings}>
                                    <div className="product_img_two_slider">
                                        <img src="https://placehold.co/300x440" alt="img" />
                                    </div>
                                    <div className="product_img_two_slider">
                                        <img src="https://placehold.co/300x440" alt="img" />
                                    </div>
                                    {
                                        product.color && product.color.map(item => (
                                            <div className="product_img_two_slider">
                                                <img src="https://placehold.co/300x440" alt="img" />
                                            </div>
                                        ))
                                    }
                                </Slider>
                            </div>

                        </div>
                        <div className="col-lg-8">
                            <div className="product_details_right_one">
                                <div className="modal_product_content_one">
                                    <h3>{product.name}</h3>
                                    {product.rating && <div className="reviews_rating">
                                        <RatingStar maxScore={5} rating={product.rating.rate} id="rating-star-common-2" />
                                        <span>({product.rating.count} Müşteri Yorumları)</span>
                                    </div>}
                                    <h4>{product.price} TL <del>{parseInt(product.price) + 17} TL</del> </h4>
                                    <p>{product.description}</p>
                                    <div className="customs_selects">
                                        <select name="product" className="customs_sel_box">
                                            <option value="">Beden</option>
                                            <option value="small">S</option>
                                            <option value="medium">M</option>
                                            <option value="learz">L</option>
                                            <option value="xl">XL</option>
                                        </select>
                                    </div>
                                    <form id="product_count_form_two">
                                        <div className="product_count_one">
                                            <div className="plus-minus-input">
                                                <div className="input-group-button">
                                                    <button type="button" className="button" onClick={decNum}>
                                                        <i className="fa fa-minus"></i>
                                                    </button>
                                                </div>
                                                <input className="form-control" type="number" value={count} readOnly />
                                                <div className="input-group-button">
                                                    <button type="button" className="button" onClick={incNum}>
                                                        <i className="fa fa-plus"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    <div className="links_Product_areas">
                                        <ul>
                                            <li>
                                                <a href="#!" className="action wishlist" title="Wishlist" onClick={() => addToFav(product.productId)}><i
                                                    className="fa fa-heart"></i>Favorilere Ekle</a>
                                            </li>
                                         
                                        </ul>
                                        <a href="#!" className="theme-btn-one btn-black-overlay btn_sm"
                                         onClick={() => addToCart(product)}>Sepete Ekle</a>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <ProductInfo />
                </div>
            </section>
            )}
            <RelatedProduct />
        </>
    )
}

export default ProductDetailsTwo