import React, { useEffect, useRef, useState } from 'react'
import TopLogin from './TopLogin'
import YourOrder from './YourOrder'
import axios from 'axios'
import ThreeDSecureModal from './ThreeDSecureModal'
import { useDispatch, useSelector } from 'react-redux'
import { CHECKOUT_URL } from '../../urls/apiUrls'
import { useNavigate } from 'react-router-dom'
import { clearCart, clearCartAsync } from '../../app/slices/product'
import Swal from 'sweetalert2'

const CheckOutTwo = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [htmlContent, setHtmlContent] = useState('');
    let user = useSelector(state => state.user.user);
    const history = useNavigate();
    const dispatch = useDispatch();

    const initiatePayment = async () => {
      try {
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const country = document.getElementById('country').value;
            const city = document.getElementById('city').value;
            const zipCode = document.getElementById('zipCode').value;
            const address = document.getElementById('address').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const cardNumber = document.getElementById('cardNumber').value;
            const cvv = document.getElementById('cvv').value;
            const expiryMonth = document.getElementById('expiryMonth').value;
            const expiryYear = document.getElementById('expiryYear').value;
            const threeD = document.getElementById('threeD').checked;

            const checkoutPayload = {
                firstName,
                lastName,
                country,
                city,
                zipCode,
                address,
                phone,
                email,
                cardNumber,
                cvv,
                expiryMonth,
                expiryYear,
                threeD,
            };

            const response = await axios.post(
                CHECKOUT_URL, 
                checkoutPayload,
                {
                headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user.token}
                }
            )
            .then(response => {
                console.log(response)
                if (response.status === 200 && (response.data === null || response.data === ''))
                {
                    dispatch(clearCartAsync())
                    history("/order-complete")
                }
                else if(response.data.htmlContent)
                {
                    setHtmlContent(response.data.htmlContent);
                    setModalIsOpen(true);
                }
            })
            .catch(error => {
                Swal.fire(
                    {
                        title: 'Error',
                        text: error.response.data,
                        icon: 'error'
                    }
                )
            });
        } catch (error) {
            console.error('Error: ', error.message);
        }
    };
    
    window.addEventListener('message', function(event) {
        if (event.data.success === "3DSUCCESS") {
            closeModal();
            dispatch(clearCartAsync())
            history("/order-complete")
        }
        else if (event.data.success === "3DFAIL"){
            closeModal();
            Swal.fire(
                {
                    title: 'Error',
                    text: event.data.errorMessage,
                    icon: 'error'
                }
            )
        }
    });


    const closeModal = () => {
      setModalIsOpen(false);
    };
        
    return (
        <>
            <section id="checkout_two" className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="checkout_area_two">
                                <div className="row">
                                    <div className="col-lg-6 col-md-6">
                                        <div className="checkout_form_area">
                                            <h3>Fatura Adresi</h3>
                                            <form action="#">
                                                <div className="row">
                                                    <div className="col-lg-6">
                                                        <div className="default-form-box">
                                                            <label >Adınız<span className="text-danger">*</span></label>
                                                            <input type="text" className="form-control" id="firstName" />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">
                                                        <div className="default-form-box">
                                                            <label>Soyadınız <span className="text-danger">*</span></label>
                                                            <input type="text" className="form-control" id="lastName" />
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="default-form-box">
                                                            <label htmlFor="country">Ülke<span className="text-danger">*</span></label>
                                                            <select className="country_option nice-select wide form-control"
                                                                name="country" id="country">
                                                                <option value="Turkey">Türkiye</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="default-form-box">
                                                            <label>Şehir<span className="text-danger">*</span></label>
                                                            <input type="text" className="form-control" id="city"/>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="default-form-box">
                                                            <label>Zipcode<span className="text-danger">*</span></label>
                                                            <input type="text" className="form-control" id="zipCode"/>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="default-form-box">
                                                            <label>Adres<span className="text-danger">*</span></label>
                                                            <input placeholder="Adres" type="text"
                                                                className="form-control" id="address"/>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">
                                                        <div className="default-form-box">
                                                            <label>Telefon <span className="text-danger" >*</span></label>
                                                            <input type="text" className="form-control" id="phone"/>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">
                                                        <div className="default-form-box">
                                                            <label> Email Adresiniz<span className="text-danger">*</span></label>
                                                            <input type="text" className="form-control" id="email"/>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-12 pb-3">
                                                        <h3>Kredi Kartı Bilgileri</h3>
                                                    </div>
                                                    <div className="col-lg-12">
                                                        <div className="default-form-box">
                                                            <label>Kredi Kartı <span className="text-danger">*</span></label>
                                                            <input type="text" className="form-control" id="cardNumber"/>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-7">
                                                        <div className="default-form-box">
                                                            <label>CVV <span className="text-danger">*</span></label>
                                                            <input type="text" className="form-control" id="cvv"/>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-2">
                                                        <div className="default-form-box">
                                                            <label>MM<span className="text-danger">*</span></label>
                                                            <input type="text" className="form-control" id="expiryMonth"/>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-2">
                                                        <div className="default-form-box">
                                                            <label> YY<span className="text-danger">*</span></label>
                                                            <input type="text" className="form-control" id="expiryYear"/>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-1">
                                                        <div className="default-form-box">
                                                            <label>3D<span className="text-danger"></span></label>
                                                            <input type="checkbox" className="form-control" id="threeD"/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div className='col-6'>
                                        <YourOrder />
                                        <div className="order_button pb-">
                                            <button className="theme-btn-one btn-black-overlay btn_sm" onClick={(e) => {initiatePayment()}}>Sipariş Ver</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div style={{ width: '100%', height: '80%' }}>
                <ThreeDSecureModal isOpen={modalIsOpen} closeModal={closeModal} htmlContent={htmlContent} messageHandler={() => {}} />
            </div>

        </>
    )
}

export default CheckOutTwo