import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2';
import { logout } from '../../app/slices/user';

const Sidebar = () => {
    const location = useLocation()
    let dispatch = useDispatch();
    const history = useNavigate()
    let status = useSelector((state) => state.user.status);
    const [logoutPressed, setLogoutPressed] = useState(false);


    useEffect(() => {
        if(logoutPressed)
            history("/login");
    }, [status]);

    const logoutUser = () => {
        setLogoutPressed(true);
        dispatch(logout())
    }

    return (
        <>
            <div className="col-sm-12 col-md-12 col-lg-3">
                <div className="dashboard_tab_button">
                    <ul role="tablist" className="nav flex-column dashboard-list">
                        <li> <Link to="/my-account/customer-order" className={location.pathname === '/my-account/customer-order'?'active':null}><i className="fa fa-cart-arrow-down"></i>Siparişlerim</Link></li>
                        <li><Link to="/my-account/customer-address" className={location.pathname === '/my-account/customer-address'?'active':null}><i className="fa fa-map-marker"></i>Addreslerim</Link></li>
                        <li><Link to="/my-account/customer-account-details" className={location.pathname === '/my-account/customer-account-details'?'active':null}><i className="fa fa-user"></i>Profilim</Link></li>
                        {
                            status?<li><Link onClick={(e)=>{e.preventDefault();logoutUser()}}><i className="fa fa-sign-out"></i>Çıkış Yap</Link></li>:null
                        }
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Sidebar
