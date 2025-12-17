import './Skeleton.css';

const Skeleton = ({ variant = 'text', width, height, className = '', style = {} }) => {
    const styles = {
        width,
        height,
        ...style,
    };

    return (
        <span
            className={`skeleton skeleton-${variant} ${className}`}
            style={styles}
        ></span>
    );
};

export default Skeleton;
