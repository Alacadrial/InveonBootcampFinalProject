import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import {Link} from "react-router-dom";
const YourOrder = () => {
    let cart = useSelector((state) => state.products.carts);
    let coupon = useSelector((state) => state.products.coupon);

    const cartTotal = (isCouponApplied) => {
        let couponMultiplier = (coupon === null) ? 1 : (100 - coupon.discountAmount) / 100;
        
        return cart.reduce(function (total, item) {
            return total + ((item.quantity || 1) * item.price);
        }, 0) * (isCouponApplied ? couponMultiplier : 1);
    }

    return (
    <>
            <h3>Siparişiniz</h3>
            <div className="order_table table">
                <table>
                    <thead className='thead-dark'>
                        <tr>
                            <th>Ürün</th>
                            <th>Toplam</th>
                        </tr>
                    </thead>
                    <tbody>
                        { cart &&
                            cart.map((cartItem, index) => {
                                return(
                                    <tr key={index}>
                                        <td>
                                            {cartItem.name} <b>x{cartItem.quantity}</b>
                                        </td>
                                        <td>
                                            {cartItem.price * cartItem.quantity}
                                        </td>
                                    </tr>
                                )
                            })
                        }
                        
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>Alt Toplam</th>
                            <td>{cartTotal(false)} TL</td>
                        </tr>
                        <tr>
                            <th>Kargo</th>
                            <td>0 TL</td>
                        </tr>
                        <tr className="order_total">
                            <th>Sipariş Toplamı </th>
                            <td><b>{cartTotal(true)} TL</b></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className="payment_method">
                <form>
                    <div className="accordion" id="accordionExample">
                        <div className="payment_area_wrappers">
                            <div className="heading_payment" id="headingOne">
                                <div className="" data-toggle="collapse" data-target="#collapseOne" >
                                    <input type="radio" name="payment" id="html" value="HTML" defaultChecked />
                                    <label htmlFor="html">Para Transferi</label>
                                </div>
                            </div>
                            <div id="collapseOne" className="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">
                                <div className="payment_body">
                                    <p>Direct Bank Transfer</p>
                                </div>
                            </div>
                        </div>
                        <div className="payment_area_wrappers">
                            <div className="heading_payment" id="headingTwo">
                                <div className="collapsed" data-toggle="collapse" data-target="#collapseTwo">
                                    <input type="radio" name="payment" id="javascript" value="JavaScript" />
                                    <label htmlFor="javascript">Mobile Bankacılık</label>
                                </div>
                            </div>
                            <div id="collapseTwo" className="collapse" data-parent="#accordionExample">
                                <div className="payment_body">
                                    <p>Direct Mobile Transfer</p>
                                </div>
                            </div>
                        </div>
                        <div className="payment_area_wrappers">
                            <div className="heading_payment" id="headingThree">
                                <div className="collapsed" data-toggle="collapse" data-target="#collapseThree">
                                    <input type="radio" name="payment" id="css" value="JavaScript" />
                                    <label htmlFor="css">Paypal</label>
                                </div>
                            </div>
                            <div id="collapseThree" className="collapse" data-parent="#accordionExample">
                                <div className="payment_body">
                                    <p></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default YourOrder