const icons = { proposal_status: '↗', comment: '◌', vote: '✓', system: 'i' }

export default function NotificationList({ notifications, onMarkRead, onMarkAllRead, onClose }) {
  const unread = notifications.filter((item) => !item.isRead).length
  return <section className="notification-menu" aria-label="Notifications">
    <header><div><span>NOTIFICATIONS</span><h2>Updates for you</h2></div><button className="notification-close" aria-label="Close notifications" onClick={onClose}>×</button></header>
    {unread > 0 && <button className="mark-all-button" onClick={onMarkAllRead}>Mark all as read</button>}
    <div className="notification-items">{notifications.length === 0 ? <p className="notification-empty">You are all caught up.</p> : notifications.map((item) => <button className={`notification-item ${item.isRead ? '' : 'unread'}`} onClick={() => onMarkRead(item.id)} key={item.id}><span className={`notification-icon ${item.type}`}>{icons[item.type]}</span><span><b>{item.title}</b><p>{item.message}</p><small>{item.time}</small></span></button>)}</div>
  </section>
}
