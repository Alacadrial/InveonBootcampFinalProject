import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getOrdersAsync } from '../../app/slices/product';

const Order = () => {
    const dispatch = useDispatch();
    let orders = useSelector(state => state.products.orders);
    let state = useSelector(state => state.user.status);
    
    useEffect(() => {
        if(state)
        {
            dispatch(getOrdersAsync());
        }
    }, [dispatch])

    return (
        <>
            {
                state ? 
                (
                <div className="orders-div">
                    <h4 className="title">Siparişlerim </h4>
                    <div className="table_page table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Sipariş No</th>
                                    <th>Tarih</th>
                                    <th>Durum</th>
                                    <th>Toplam</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {   
                                    orders.map(order => (
                                        <tr key={order.orderHeaderId}>
                                            <td>{order.orderHeaderId}</td>
                                            <td>{order.orderTimeString}</td>
                                            {
                                                order.paymentStatus 
                                                ? <td><span className="badge badge-info">Tamamlandı</span></td> 
                                                : <td><span className="badge badge-error">Problem Oluştu</span></td>
                                            }
                                            <td>{order.discountTotal}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                )   : (<h4>Siparişleri görmek için login olmanız gerekir.</h4>)
            }
            
        </>
    )
}

export default Order
