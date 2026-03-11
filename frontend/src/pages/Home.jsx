import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterButtons from '../components/FilterButtons';


const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const searchQuery = searchParams.get('search') || '';
    fetchVideos(selectedCategory, searchQuery);
  }, [selectedCategory, searchParams]);

  const fetchVideos = async (category, search) => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      
      const data = await videoService.getAllVideos(params);
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const currentSearch = searchParams.get('search');
    if (currentSearch) {
      setSearchParams({ category, search: currentSearch });
    } else {
      setSearchParams({ category });
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="sticky top-14 bg-white z-40 pb-4 -mt-2 pt-2 border-b">
        <FilterButtons
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-video rounded-xl"></div>
              <div className="flex space-x-3 mt-3">
                <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No videos found</p>
          <p className="text-gray-400 text-sm mt-2">Try changing your search or filter</p>
        </div>
      )}
    </div>
  );
};

export default Home;