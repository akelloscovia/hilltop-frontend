import React from 'react';
import './skeleton.css';

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-header"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text" style={{ width: '85%' }}></div>
  </div>
);

export const SkeletonLoading = ({ count = 3 }) => (
  <div className="skeleton-container">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonPage = () => (
  <div style={{ padding: '20px' }}>
    <div className="skeleton skeleton-header" style={{ height: '60px', marginBottom: '20px' }}></div>
    <div className="skeleton skeleton-text" style={{ marginBottom: '15px' }}></div>
    <div className="skeleton skeleton-text" style={{ width: '90%', marginBottom: '15px' }}></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

