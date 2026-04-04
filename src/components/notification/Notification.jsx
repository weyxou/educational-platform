// import { useState, useEffect, useRef } from 'react';
// import { notificationApi } from '../../api/notificationApi';
// import { useNavigate } from 'react-router-dom';
// import './Notification.css';

// export default function Notification() {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchUnreadCount();
//     const interval = setInterval(fetchUnreadCount, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchUnreadCount = async () => {
//     try {
//       const res = await notificationApi.getUnreadCount();
//       setUnreadCount(res.data);
//     } catch (err) {
//       console.error('Failed to fetch unread count', err);
//     }
//   };

//   const fetchNotifications = async () => {
//     setLoading(true);
//     try {
//       const res = await notificationApi.getAll();
//       setNotifications(res.data || []);
//     } catch (err) {
//       console.error('Failed to fetch notifications', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOpen = () => {
//     if (!isOpen) fetchNotifications();
//     setIsOpen(!isOpen);
//   };

//   const handleMarkAsRead = async (notificationId) => {
//     try {
//       await notificationApi.markAsRead(notificationId);
//       setNotifications(prev =>
//         prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
//       );
//       setUnreadCount(prev => Math.max(0, prev - 1));
//     } catch (err) {
//       console.error('Failed to mark as read', err);
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     try {
//       await notificationApi.markAllAsRead();
//       setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
//       setUnreadCount(0);
//     } catch (err) {
//       console.error('Failed to mark all as read', err);
//     }
//   };

//   const handleNotificationClick = (notification) => {
//     if (!notification.isRead) {
//       handleMarkAsRead(notification.notificationId);
//     }
//     switch (notification.notificationType) {
//       case 'assignment':
//         navigate(`/courses/${notification.referenceId}/assignments`);
//         break;
//       case 'grade':
//         navigate(`/courses/${notification.referenceId}/grades`);
//         break;
//       case 'enrollment':
//         navigate(`/courses/${notification.referenceId}/view`);
//         break;
//       default:
//         break;
//     }
//     setIsOpen(false);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   return (
//     <div className="notification-bell" ref={dropdownRef}>
//       <button className="bell-icon" onClick={handleOpen}>
//         🔔
//         {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
//       </button>

//       {isOpen && (
//         <div className="notification-dropdown">
//           <div className="dropdown-header">
//             <span>Уведомления</span>
//             {unreadCount > 0 && (
//               <button className="mark-all-read" onClick={handleMarkAllAsRead}>
//                 Прочитать всё
//               </button>
//             )}
//           </div>
//           <div className="dropdown-list">
//             {loading && <div className="notification-item">Загрузка...</div>}
//             {!loading && notifications.length === 0 && (
//               <div className="notification-item">Нет уведомлений</div>
//             )}
//             {notifications.map(notif => (
//               <div
//                 key={notif.notificationId}
//                 className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
//                 onClick={() => handleNotificationClick(notif)}
//               >
//                 <div className="notification-message">{notif.message}</div>
//                 <div className="notification-date">
//                   {new Date(notif.createdAt).toLocaleString()}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }