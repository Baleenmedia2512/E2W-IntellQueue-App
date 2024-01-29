'use client'
const BottomBar = () => {
    return (
      <footer>
        <p>This is the bottom bar. Add your content here.</p>
        <style jsx>{`
        footer {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: #333;
          color: #fff;
          padding: 10px;
          text-align: center;
        }
      `}</style>
      </footer>
    );
  };
  
  export default BottomBar;
  