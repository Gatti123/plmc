import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts';

const TOPICS = [
  { id: 'politics', name: 'Politics', icon: '🏛️' },
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'science', name: 'Science', icon: '🔬' },
  { id: 'philosophy', name: 'Philosophy', icon: '🧠' },
  { id: 'religion', name: 'Religion', icon: '🙏' },
  { id: 'art', name: 'Art & Culture', icon: '🎨' },
  { id: 'environment', name: 'Environment', icon: '🌍' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'economics', name: 'Economics', icon: '📈' },
  { id: 'health', name: 'Health & Medicine', icon: '🏥' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'food', name: 'Food & Cuisine', icon: '🍲' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'movies', name: 'Movies & TV', icon: '🎬' },
  { id: 'gaming', name: 'Gaming', icon: '🎮' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'relationships', name: 'Relationships', icon: '❤️' },
  { id: 'parenting', name: 'Parenting', icon: '👶' },
  { id: 'languages', name: 'Languages', icon: '🗣️' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

const CONTINENTS = [
  { code: 'any', name: 'Any Region' },
  { code: 'na', name: 'North America' },
  { code: 'sa', name: 'South America' },
  { code: 'eu', name: 'Europe' },
  { code: 'as', name: 'Asia' },
  { code: 'af', name: 'Africa' },
  { code: 'oc', name: 'Oceania' },
];

const ROLES = [
  { id: 'participant', name: 'Participant' },
  { id: 'observer', name: 'Observer' },
];

// Sample conversation starters for each topic
const CONVERSATION_STARTERS = {
  politics: [
    "What's your view on the role of government in society?",
    "How do you feel about the current political climate in your country?",
    "What political system do you think works best and why?",
  ],
  technology: [
    "Do you think AI will ultimately benefit or harm humanity?",
    "What technological innovation are you most excited about?",
    "How has technology changed your daily life in the past decade?",
  ],
  // Add more starters for other topics as needed
};

const TopicSelector = ({ 
  selectedTopic, 
  onTopicSelect, 
  filters, 
  setFilters, 
  role, 
  setRole, 
  onFindPartner,
  isFinding 
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showStarters, setShowStarters] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});

  // Track online users for each topic
  useEffect(() => {
    if (!user) return;

    console.log('Starting room listener for user:', user.uid);

    const roomsQuery = query(
      collection(db, 'rooms'),
      where('status', 'in', ['waiting', 'active'])
    );

    const unsubscribe = onSnapshot(roomsQuery, (snapshot) => {
      console.log('Received snapshot with', snapshot.docs.length, 'rooms');
      
      const topicCounts = {};
      
      // Initialize counts for all topics
      TOPICS.forEach(topic => {
        topicCounts[topic.id] = 0;
      });

      // Count users in rooms
      snapshot.docs.forEach(doc => {
        const room = doc.data();
        console.log('Processing room:', {
          id: doc.id,
          topic: room.topic,
          status: room.status,
          createdBy: room.createdBy,
          participants: room.participants?.length || 0
        });
        
        // Skip own rooms
        if (room.createdBy === user.uid) {
          console.log('Skipping own room');
          return;
        }
        
        // Count participants in each room
        if (room.topic && topicCounts.hasOwnProperty(room.topic)) {
          if (room.participants) {
            console.log(`Adding ${room.participants.length} participants for topic:`, room.topic);
            topicCounts[room.topic] += room.participants.length;
          }
        }
      });

      console.log('Final topic counts:', topicCounts);
      setOnlineUsers(topicCounts);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredTopics = TOPICS.filter((topic) =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTopicSelect = (topicId) => {
    onTopicSelect(topicId);
    setShowStarters(true);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Discussion Partner</h2>
        
        {/* Search input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full"
          />
        </div>

        {/* Topics Grid */}
        <div className="topics-grid">
          {filteredTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleTopicSelect(topic.id)}
              className={`topic-card ${
                selectedTopic === topic.id
                  ? 'topic-card-selected'
                  : 'topic-card-default'
              }`}
            >
              <div className="text-2xl mb-2">{topic.icon}</div>
              <div className="font-medium">{topic.name}</div>
              {onlineUsers[topic.id] > 0 && (
                <div 
                  className="online-badge"
                  style={{
                    backgroundColor: selectedTopic === topic.id ? 'rgba(255, 255, 255, 0.2)' : 'rgba(79, 70, 229, 0.1)',
                    color: selectedTopic === topic.id ? 'white' : '#4F46E5'
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  {onlineUsers[topic.id]} online
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Conversation Starters */}
        {selectedTopic && CONVERSATION_STARTERS[selectedTopic] && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Conversation Starters</h3>
            <ul className="space-y-2 text-gray-600">
              {CONVERSATION_STARTERS[selectedTopic].map((starter, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{starter}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicSelector; 