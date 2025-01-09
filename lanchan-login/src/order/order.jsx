import React, { useState, useEffect } from 'react';
import { Navbarow } from "../owner/Navbarowcomponent/navbarow/index-ow";
import {
 
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

function OrderDisplay() {
  const [orders, setOrders] = useState([]);
  const [noodleMenu, setNoodleMenu] = useState([]);
  const [otherMenu, setOtherMenu] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [soups, setSoups] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [meats, setMeats] = useState([]);
  const [noodleTypes, setNoodleTypes] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchMenus();
    fetchAllData();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3333/getpreparingorders');
      if (response.ok) {
        const data = await response.json();
        const ordersWithDetails = await Promise.all(data.map(async (order) => {
          const detailsResponse = await fetch(`http://localhost:3333/getorderdetail/${order.Order_id}`);
          const details = await detailsResponse.json();
          return { ...order, details: details.filter(item => item.status_id === 1) }; 
        }));
        setOrders(ordersWithDetails);
      } else {
        console.error('Failed to fetch preparing orders');
      }
    } catch (error) {
      console.error('Error fetching preparing orders:', error);
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
      console.log('Other Menu:', otherData);    // เพิ่ม log
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };
  
  const fetchAllData = async () => {
    try {
      const [soupRes, sizeRes, meatRes, noodleTypeRes] = await Promise.all([
        fetch('http://localhost:3333/soups'),
        fetch('http://localhost:3333/sizes'),
        fetch('http://localhost:3333/meats'),
        fetch('http://localhost:3333/noodletypes')
      ]);

      const [soupData, sizeData, meatData, noodleTypeData] = await Promise.all([
        soupRes.json(),
        sizeRes.json(),
        meatRes.json(),
        noodleTypeRes.json()
      ]);

      setSoups(soupData);
      setSizes(sizeData);
      setMeats(meatData);
      setNoodleTypes(noodleTypeData);
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

  const handleUpdateStatus = (itemId) => {
    setUpdatingItemId(itemId);
    setOpenDialog(true);
  };

  const confirmUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:3333/updateorderstatus/${updatingItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 2 }),
      });

      if (response.ok) {
        setOrders(prevOrders =>
          prevOrders.map(order => ({
            ...order,
            details: order.details.filter(item => item.Order_detail_id !== updatingItemId)
          })).filter(order => order.details.length > 0)
        );
        setOpenDialog(false);
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (!Array.isArray(noodleMenu) || !Array.isArray(otherMenu)) {
    return <div>Loading menus...</div>;
  }


  const handleUpdateAllStatus = async (orderId) => {
    try {
      const order = orders.find(o => o.Order_id === orderId);
      if (!order) throw new Error('Order not found');
  
      await Promise.all(order.details.map(item =>
        fetch(`http://localhost:3333/updateorderstatus/${item.Order_detail_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 2 }),
        })
      ));
  
      // อัปเดต state ของ orders
      setOrders(prevOrders =>
        prevOrders.filter(o => o.Order_id !== orderId)
      );
  
      alert('อัปเดตสถานะทั้งหมดเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error updating all statuses:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
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

  return (
    <div style={styles.orderPage}>
      <Navbarow />
      <div style={styles.orderContainer}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>รายการออเดอร์ที่สั่ง</h1>
        {orders.length === 0 ? (
          <h2 style={{ textAlign: 'center' }}>ไม่มีรายการออเดอร์สั่ง</h2>
        ) : (
          orders.map((order) => (
            <div key={order.Order_id} style={styles.orderItem}>
              <div style={styles.orderHeader}>
                <h2>เลขออเดอร์: {order.Order_id}</h2>
                <h2>โต๊ะที่: {order.tables_id}</h2>
              </div>
              <p style={{fontSize: '1.5rem', marginBottom: '1rem'}}>เวลาสั่ง: {formatThaiDateTime(order.Order_datetime)}</p>              

              <ul style={{ listStyle: 'none', padding: 0 }}>
              {order.details.map((item) => {
 const itemDetails = getItemDetails(item);
 return itemDetails ? (
   <li key={item.Order_detail_id} style={{
     display: 'flex',
     flexDirection: 'column',
     backgroundColor: 'white', 
     padding: '1.5rem',
     margin: '1rem 0',
     borderRadius: '8px',
     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
     position: 'relative',
     minHeight: '150px'
   }}>
     <div>
       <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>{itemDetails.name}</h2>
       <div style={{fontSize: '1.4rem', marginBottom: '0.5rem'}}>จำนวน: {item.Order_detail_quantity}</div>
       {item.Order_detail_additional && (
         <div style={{fontSize:'1.4rem',color: 'red', marginBottom: '0.5rem'}}>
           เพิ่มเติม: {item.Order_detail_additional}
         </div>
       )}
       <div  style={{fontSize:'1.4rem', marginBottom: '0.5rem'}}>รับกลับบ้าน: {item.Order_detail_takehome ? 'ใช่' : 'ไม่'}</div>
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
       อัปเดต
     </button>
   </li>
 ) : null;
})}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                onClick={() => handleUpdateAllStatus(order.Order_id)}
                style={{
                  width: '100%', padding: '0.75rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', marginTop: '1rem'
                }}
              >
                อัปเดตสถานะทั้งหมด
              </button>
            </div>
            </div>
          ))
        )}
      </div>

      {openDialog && (
        <div style={styles.dialog}>
          <div style={styles.dialogContent}>
            <h2>ยืนยันการอัปเดตสถานะ</h2>
            <p>คุณต้องการอัปเดตสถานะเป็น "เสิร์ฟแล้ว" ใช่หรือไม่?</p>
            <div style={styles.dialogButtons}>
              <button onClick={() => setOpenDialog(false)} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}>ยกเลิก</button>
              <button onClick={confirmUpdate} style={{ ...styles.updateButton, padding: '0.5rem 1rem' }}>
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDisplay;