import React, { useState, useEffect } from 'react';

import { Navbarow } from '../owner/Navbarowcomponent/navbarow/index-ow';
import Promtpay from '../assets/images/promtpay.jpg'

import {
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel
} from '@mui/material';

const styles = {
  orderPage: {
    padding: '1rem',
  },
  orderContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  orderItem: {
    backgroundColor: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1rem',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  menuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #eee',
  },
  updateButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
  },
  dialog: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    maxWidth: '400px',
    width: '100%',
  },
  dialogButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
};
const OrderDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [soups, setSoups] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [meats, setMeats] = useState([]);
  const [noodleTypes, setNoodleTypes] = useState([]);
  const [noodleMenu, setNoodleMenu] = useState([]);
  const [otherMenu, setOtherMenu] = useState([]);
  const [cashAmount, setCashAmount] = useState('');
  const [showChange, setShowChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);




  const paymentDetails = {
    promptpay: {
      qrCode: Promtpay,
      phoneNumber: "099-999-9999"
    }

  };

  const handleCheckboxChange = (orderId, itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [itemId]: !prev[orderId]?.[itemId]
      }
    }));

    // Update selectAll state based on whether all items are checked
    const order = orders.find(o => o.Order_id === orderId);
    const updatedCheckedItems = {
      ...checkedItems,
      [orderId]: {
        ...checkedItems[orderId],
        [itemId]: !checkedItems[orderId]?.[itemId]
      }
    };

    const allItemsChecked = order.details.every(item =>
      updatedCheckedItems[orderId]?.[item.Order_detail_id]
    );
    setSelectAll(allItemsChecked);
  };

  // Handler for "Select All" checkbox
  const handleSelectAllChange = (orderId) => {
    const order = orders.find(o => o.Order_id === orderId);
    const newSelectAll = !selectAll;

    setSelectAll(newSelectAll);

    const newCheckedItems = {
      ...checkedItems,
      [orderId]: order.details.reduce((acc, item) => ({
        ...acc,
        [item.Order_detail_id]: newSelectAll
      }), {})
    };

    setCheckedItems(newCheckedItems);
  };

  // Calculate total price for checked items
  const calculateCheckedItemsTotal = (orderId) => {
    const order = orders.find(o => o.Order_id === orderId);
    return order.details.reduce((total, item) => {
      if (checkedItems[orderId]?.[item.Order_detail_id]) {
        return total + (item.Order_detail_price * item.Order_detail_quantity);
      }
      return total;
    }, 0);
  };
  useEffect(() => {
    fetchOrders();
    fetchMenus();
    fetchAllData();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3333/getserveoder');
      if (response.ok) {
        const data = await response.json();
        const ordersWithDetails = await Promise.all(data.map(async (order) => {
          const detailsResponse = await fetch(`http://localhost:3333/getorderdetail/${order.Order_id}`);
          const details = await detailsResponse.json();
          return { ...order, details: details.filter(item => item.status_id === 2) };
        }));
        setOrders(ordersWithDetails);
      } else {
        console.error('Failed to fetch  orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };


  const fetchMenus = async () => {
    try {
      const [noodleRes, otherRes] = await Promise.all([
        fetch('http://localhost:3333/getnoodlemenu'),
        fetch('http://localhost:3333/getmenu')
      ]);
      const [noodleData, otherData] = await Promise.all([
        noodleRes.json(),
        otherRes.json()
      ]);
      setNoodleMenu(noodleData);
      setOtherMenu(otherData);
      console.log('Noodle Menu:', noodleData);
      console.log('Other Menu:', otherData);
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };
  const fetchAllData = async () => {
    try {
      const [soupRes, sizeRes, meatRes, noodleTypeRes, noodleMenuRes] = await Promise.all([
        fetch('http://localhost:3333/soups'),
        fetch('http://localhost:3333/sizes'),
        fetch('http://localhost:3333/meats'),
        fetch('http://localhost:3333/noodletypes'),
        fetch('http://localhost:3333/getnoodlemenu')
      ]);

      const [soupData, sizeData, meatData, noodleTypeData, noodleMenuData] = await Promise.all([
        soupRes.json(),
        sizeRes.json(),
        meatRes.json(),
        noodleTypeRes.json(),
        noodleMenuRes.json()
      ]);

      setSoups(soupData);
      setSizes(sizeData);
      setMeats(meatData);
      setNoodleTypes(noodleTypeData);
      setNoodleMenu(noodleMenuData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getNoodleTypeName = (id) => {
    const noodle = noodleTypes.find(type => type.Noodle_type_id === id);
    return noodle ? noodle.Noodle_type_name : 'ไม่ระบุ';
  };

  const getSoupName = (id) => {
    const soup = soups.find(s => s.Soup_id === id);
    return soup ? soup.Soup_name : 'ไม่ระบุ';
  };

  const getMeatName = (id) => {
    const meat = meats.find(m => m.Meat_id === id);
    return meat ? meat.Meat_name : 'ไม่ระบุ';
  };

  const getSizeName = (id) => {
    const size = sizes.find(s => s.Size_id === id);
    return size ? size.Size_name : 'ไม่ระบุ';
  };

  function getMenuName(noodleMenu) {
    if (!noodleMenu) return 'ไม่ระบุ';
    const noodle_type_name = getNoodleTypeName(noodleMenu.Noodle_type_id);
    const soup_name = getSoupName(noodleMenu.Soup_id);
    const meat_name = getMeatName(noodleMenu.Meat_id);
    const size_name = getSizeName(noodleMenu.Size_id);
    return `${noodle_type_name} ${soup_name} ${meat_name} (${size_name})`;
  }

  const getItemDetails = (item) => {
    if (item.Noodle_menu_id && Array.isArray(noodleMenu)) {
      const noodle = noodleMenu.find(n => n.Noodle_menu_id === item.Noodle_menu_id);
      return noodle ? {
        name: getMenuName(noodle),
        price: noodle.Noodle_menu_price,
      } : null;
    } else if (item.Menu_id && Array.isArray(otherMenu)) {
      const other = otherMenu.find(o => o.Menu_id === item.Menu_id);
      return other ? {
        name: other.Menu_name,
        price: other.Menu_price,

      } : null;
    }
    return null;
  };


  //ปุ่มชำระเงินเเต่ละรายการ
  const handleUpdateStatus = (itemId) => {
    setUpdatingItemId(itemId);
    setOpenDialog(true);
    setPaymentMethod('cash');
    setShowPaymentDetails(false);
  };




  const confirmUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:3333/updateorderstatus/${updatingItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 3 }),
      });

      if (response.ok) {
        setOrders(prevOrders =>
          prevOrders.map(order => ({
            ...order,
            details: order.details.filter(item => item.Order_detail_id !== updatingItemId)
          })).filter(order => order.details.length > 0)
        );
        setOpenDialog(false);
        alert('อัปเดตสถานะเรียบร้อยแล้ว');
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };
  const handlePayment = (orderId) => {
    setPayingOrderId(orderId);
    setOpenPaymentDialog(true);
    setPaymentMethod('3');
    setShowPaymentDetails(false);
  };

  const handlePaymentSelection = (method) => {
    setPaymentMethod(method);
    if (method === 'promptpay' || method === 'cash') {
      setShowPaymentDetails(true);
    } else {
      setShowPaymentDetails(false);
    }
  };

  const handleClosePayment = () => {
    setOpenPaymentDialog(false);
    setPaymentMethod(null);
    setPayingOrderId(null);
    setShowPaymentDetails(false);
  };

  const subCashPayment = () => {
    const cash = parseFloat(cashAmount);
    if (isNaN(cash)) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }

    // หารายการที่กำลังจะชำระเงิน
    const currentOrder = orders.find(order =>
      order.details.some(item => item.Order_detail_id === updatingItemId)
    );
    if (!currentOrder) return;

    // หารายการอาหารในorder เฉพาะ order นั้นๆ
    const payingItem = currentOrder.details.find(item => item.Order_detail_id === updatingItemId);
    if (!payingItem) return;


    const total = payingItem.Order_detail_price * payingItem.Order_detail_quantity;
    const change = cash - total;

    if (change < 0) {
      alert('จำนวนเงินไม่เพียงพอ');
      return;
    }

    setChangeAmount(change);
    setShowChange(true);
  };

  const calculateTotalPrice = (details) => {
    return details.reduce((total, item) => total + (item.Order_detail_price * item.Order_detail_quantity), 0);
  };

  const confirmPayment = async () => {
    try {
      // อัปเดตสถานะการชำระเงินของออเดอร์
      const orderResponse = await fetch(`http://localhost:3333/updateorderpayment/${payingOrderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethod }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to update order payment status');
      }

      //ตวรจสอบหาorder ที่กำลังชำระเงิน
      const order = orders.find(o => o.Order_id === payingOrderId);

      if (order) {
        //อัปเดตสถานะโต๊ะเมื่อกดชำระเงินเรียนร้อบ
        const tableResponse = await fetch(`http://localhost:3333/updatetablestatus/${order.tables_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'Available' }),
        });

        if (!tableResponse.ok) {
          throw new Error('Fail to update table status');
        }
        // อัปเดตสถานะของทุกรายการในออเดอร์
        await Promise.all(order.details.map(item =>
          fetch(`http://localhost:3333/updateorderstatus/${item.Order_detail_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: `3` }),
          })
        ));

        // อัปเดต state ของ orders
        setOrders(prevOrders =>
          prevOrders.filter(o => o.Order_id !== payingOrderId)
        );

        handleClosePayment();
        alert('ชำระเงินเรียบร้อยแล้ว');
      } else {
        throw new Error('Order not found');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะการชำระเงิน');
    }
  };

  const formatThaiDateTime = (dateTime) => {
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const date = new Date(dateTime);
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543 - 2500;
    const time = date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return `${day} ${month} ${year} ${time} น.`;
  };

  const handleCashPayment = () => {
    const cash = parseFloat(cashAmount);
    if (isNaN(cash)) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }

    // Find the order containing the item being updated
    const currentOrder = orders.find(order =>
      order.details.some(item => item.Order_detail_id === updatingItemId)
    );

    if (!currentOrder) return;

    const total = calculateTotalPrice(currentOrder.details);
    const change = cash - total;

    if (change < 0) {
      alert('จำนวนเงินไม่เพียงพอ');
      return;
    }

    setChangeAmount(change);
    setShowChange(true);
  };




  return (
    <div style={styles.orderPage}>
      <Navbarow />
      <div style={styles.orderContainer}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>ชำระเงิน</h1>
        {orders.length === 0 ? (
          <h2 style={{ textAlign: 'center' }}>ไม่มีรายการชำระ</h2>
        ) : (
          orders.map((order) => (
            <div key={order.Order_id} style={{ backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h2>เลขออเดอร์: {order.Order_id}</h2>
                <h2>โต๊ะที่: {order.tables_id}</h2>
              </div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={order.details.every(item => checkedItems[order.Order_id]?.[item.Order_detail_id])}
                    onChange={() => handleSelectAllChange(order.Order_id)}
                  />
                }
                label="เลือกทั้งหมด"
              />
              <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>เวลาสั่ง: {formatThaiDateTime(order.Order_datetime)}</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
               
                {order.details.map((item) => {
                  const itemDetails = getItemDetails(item);
                  /* console.log('Order Detail Takehome value:', {
                    value: item.Order_detail_takehome,
                    type: typeof item.Order_detail_takehome,
                    item_id: item.Order_detail_id
                  */
                  
                  return itemDetails ? (
                    <li key={item.Order_detail_id} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'white',
                      padding: '0.1rem',
                      margin: '1rem 0',
                      borderRadius: '5px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      position: 'relative',
                      minHeight: '150px'
                    }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={checkedItems[order.Order_id]?.[item.Order_detail_id] || false}
                            onChange={() => handleCheckboxChange(order.Order_id, item.Order_detail_id)}
                          />
                        }
                        label=""
                      />
                      <div>
                        <strong style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>{itemDetails.name}</strong>
                        <p style={{ fontSize: '1.5rem' }}>
                          จำนวน: {item.Order_detail_quantity}, <br />ราคา: {item.Order_detail_price * item.Order_detail_quantity} บาท
                          {item.Order_detail_additional && (
                            <>
                              <br /><span>เพิ่มเติม: {item.Order_detail_additional}</span>
                            </>
                          )}
                          <br />
                         
                          {(item.Order_detail_takehome) === 1 ? 'กลับบ้าน' : 'กินที่ร้าน'}
                          

                        </p>
                      </div>
                      <button
                        onClick={() => handleUpdateStatus(item.Order_detail_id)}
                        style={{
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          position: 'absolute',
                          bottom: '1rem',
                          right: '1rem'
                        }}
                      >
                        ชำระเงิน
                      </button>
                    </li>
                  ) : null;
                })}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '2px solid #eee', paddingTop: '1rem' }}>
                <h3>ราคารวมรายการที่เลือก:</h3>
                <h3>{calculateCheckedItemsTotal(order.Order_id).toFixed(2)} บาท</h3>
              </div>
              <button
                onClick={() => handlePayment(order.Order_id)}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', marginTop: '1rem' }}
              >
                ชำระรายการที่เลือก
              </button>
            </div>
          ))
        )}
      </div>


      {openDialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', maxWidth: '400px', width: '100%' }}>
            <h2>เลือกวิธีการชำระเงิน</h2>
            <button
              onClick={() => handlePaymentSelection('cash')}
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '0.5rem', backgroundColor: paymentMethod === 'cash' ? '#4CAF50' : '#f0f0f0' }}
            >
              เงินสด
            </button>
            <button
              onClick={() => handlePaymentSelection('promptpay')}
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '0.5rem', backgroundColor: paymentMethod === 'promptpay' ? '#4CAF50' : '#f0f0f0' }}
            >
              พร้อมเพย์
            </button>


            {showPaymentDetails && (
              <div style={{ marginTop: '1rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '0.25rem' }}>
                {paymentMethod === 'cash' && (
                  <>
                    <h3>กรอกจำนวนเงิน</h3>
                    <TextField
                      fullWidth
                      label="จำนวนเงิน"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      type="number"
                      style={{ marginBottom: '1rem' }}
                    />
                    <button
                      onClick={subCashPayment}
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                    >
                      ยืนยัน
                    </button>
                    <p>เบอร์โทรศัพท์: {paymentDetails.promptpay.phoneNumber}</p>
                  </>
                )}
                {showChange && (
                  <Dialog open={showChange} onClose={() => setShowChange(false)}>
                    <DialogTitle>เงินทอน</DialogTitle>
                    <DialogContent>
                      <p style={{ frontSize: '1.5rem' }}> {changeAmount.toFixed(2)} บาท</p>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setShowChange(false)}>ตกลง</Button>
                    </DialogActions>
                  </Dialog>
                )}
                {paymentMethod === 'promptpay' && (
                  <>
                    <h3>QR Code พร้อมเพย์</h3>
                    <img
                      src={paymentDetails.promptpay.qrCode}
                      alt="QR Code"
                      style={{ width: '100%', maxWidth: '200px', display: 'block', margin: '0 auto' }}
                    />
                    <p>เบอร์โทรศัพท์: {paymentDetails.promptpay.phoneNumber}</p>
                  </>
                )}

              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => setOpenDialog(false)} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}>ยกเลิก</button>
              <button
                onClick={confirmUpdate}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
              >
                ยืนยันการชำระเงิน
              </button>
            </div>
          </div>
        </div>
      )}

      {openPaymentDialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', maxWidth: '400px', width: '100%' }}>
            <h2>เลือกวิธีการชำระเงิน</h2>
            <button
              onClick={() => handlePaymentSelection('cash')}
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '0.5rem', backgroundColor: paymentMethod === 'cash' ? '#2196F3' : '#f0f0f0', color: paymentMethod === 'cash' ? 'white' : 'black' }}
            >
              เงินสด
            </button>
            <button
              onClick={() => handlePaymentSelection('promptpay')}
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '0.5rem', backgroundColor: paymentMethod === 'promptpay' ? '#2196F3' : '#f0f0f0', color: paymentMethod === 'promptpay' ? 'white' : 'black' }}
            >
              พร้อมเพย์
            </button>


            {showPaymentDetails && (
              <div style={{ marginTop: '1rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '0.25rem' }}>
                {paymentMethod === 'cash' && (
                  <>
                    <h3>กรอกจำนวนเงิน</h3>
                    <TextField
                      fullWidth
                      label="จำนวนเงิน"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      type="number"
                      style={{ marginBottom: '1rem' }}
                    />
                    <button
                      onClick={handleCashPayment}
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                    >
                      ยืนยัน
                    </button>
                    <p>เบอร์โทรศัพท์: {paymentDetails.promptpay.phoneNumber}</p>
                    {showChange && (
                      <Dialog open={showChange} onClose={() => setShowChange(false)}>
                        <DialogTitle>เงินทอน</DialogTitle>
                        <DialogContent>
                          <p style={{ frontSize: '1.5rem' }}> {changeAmount.toFixed(2)} บาท</p>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={() => setShowChange(false)}>ตกลง</Button>
                        </DialogActions>
                      </Dialog>
                    )}
                  </>
                )}
                {paymentMethod === 'promptpay' ? (
                  <>
                    <h3>QR Code พร้อมเพย์</h3>
                    <img src={paymentDetails.promptpay.qrCode} alt="QR Code" style={{ width: '100%', maxWidth: '200px', display: 'block', margin: '0 auto' }} />
                    <p>เบอร์โทรศัพท์: {paymentDetails.promptpay.phoneNumber}</p>
                  </>
                ) : paymentMethod === 'banktransfer' ? (
                  <>
                    <h3>ข้อมูลบัญชีธนาคาร</h3>
                    <p>ธนาคาร: {paymentDetails.banktransfer.bankName}</p>
                    <p>เลขบัญชี: {paymentDetails.banktransfer.accountNumber}</p>
                    <p>ชื่อบัญชี: {paymentDetails.banktransfer.accountName}</p>
                  </>
                ) : null}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={handleClosePayment} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}>ยกเลิก</button>
              <button
                onClick={confirmPayment}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                ยืนยันการชำระเงิน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDisplay;