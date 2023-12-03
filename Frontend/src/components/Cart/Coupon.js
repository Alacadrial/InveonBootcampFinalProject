import axios from 'axios';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2'
import { APPLY_COUPON_URL } from '../../urls/apiUrls';
import { applyCouponAsync } from '../../app/slices/product';
import { clearError } from '../../app/slices/product';

const Coupon = () => {
    let user = useSelector(state => state.user.user)
    let {coupon, error} = useSelector(state => state.products)
    const dispatch = useDispatch();

    const applyCoupon = (e) => {
        e.preventDefault();
        let code = document.getElementById("code").value;
        dispatch(applyCouponAsync(code))
    }

    useEffect(() => {
        if(error){
            Swal.fire({
                icon: 'error',
                title: 'Hata',
                text: error
            });
            dispatch(clearError())
        }
    }, [error]);

    useEffect(() => {
        if(coupon)
        {
            Swal.fire({
                icon: 'success',
                title: 'Kupon eklendi.',
                text: `Indirim oranı: %${coupon.discountAmount}`
            });
        }
    }, [coupon]);
    return (
        <>
            <div className="col-lg-6 col-md-6">
                <div className="coupon_code left">
                    <h3>Kupon</h3>
                    <div className="coupon_inner">
                        <p>Kupon Kodu Giriniz</p>
                        <form onSubmit={(e) => {applyCoupon(e)}}>
                            <input className="mb-2" placeholder="Coupon code" type="text" required name="code" id="code"/>
                            <button type="submit" className="theme-btn-one btn-black-overlay btn_sm">Onayla</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Coupon