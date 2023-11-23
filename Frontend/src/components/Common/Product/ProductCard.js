import React, {useState} from "react";
import { useDispatch } from "react-redux";
import {Link} from "react-router-dom";
import {AiOutlineHeart} from 'react-icons/ai';
import { AddToCart, addToFavorites } from "../../../app/slices/product";

//Her bir ürünü temsil edecek
const ProductCard = (props) => {
        let dispatch=  useDispatch();

        const sepeteEkle = async(id) => {
            console.log("tıklandı" , id);
            dispatch(AddToCart(id))
        }
        
        const favorilereEkle = async(id) => {
            console.log("tıklandı");
            dispatch(addToFavorites(id))
        }
    return(
        <>
         <div className="product_wrappers_one">
            <div className="thumb">
                 <Link to={`/product-details-two/${props.data.productId}`} className="image">
                    <img src="https://placehold.co/300x440" alt={props.data.name}></img>
                    <img className="hover-image" src="https://placehold.co/300x440" alt={props.data.title} />
                 </Link>
                   <span className="badges">
                    <span className={(['yaz','yeni','satışta'][Math.round(Math.random()*2)])} >
                        {props.data.labels}
                    </span>
                   </span>
                   <div className="actions">
                     <a href="#!" className="action wishlist" title="Favorilere Ekle"
                      onClick={() => favorilereEkle(props.data.productId)} ><AiOutlineHeart />

                     </a>
                 </div>
                 <button type="button" className="add-to-cart offcanvas-toggle" 
                    onClick={() => sepeteEkle(props.data.productId)} >Sepete Ekle</button>
             </div>
             <div className="content">
                <h5 className="title">
                    <Link to={`/product-details-two/${props.data.productId}`}>{props.data.name}</Link>
                </h5>
                <span className="price">
                    <span className="new">{props.data.price}TL</span>
                </span>
             </div>
               
            </div>
        </>
    )
}

export default ProductCard