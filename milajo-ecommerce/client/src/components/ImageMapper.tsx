import handbagBlack from '../images/handbag-black.jpg';
import handbagBrown from '../images/handbag-brown.jpg';
import handbagOrange from '../images/handbag-orange.jpg';
import shoesBlue from '../images/shoes-blue.jpg';
import shoesPink from '../images/shoes-pink.jpg';
import shoesPurple from '../images/shoes-purple.jpg';
import watchBrown from '../images/watch-brown.jpg';
import watchGreen from '../images/watch-green.jpg';
import watchYellow from '../images/watch-yellow.jpg';
import ring from '../images/ring.jpg';

import styles from '../styles/ImageMapper.module.css';
// Object mapping names to image URLs
const imageMap: { [key: string]: { url: string; attribution: string } } = {
    handbagBlack: { url: handbagBlack, attribution: "Photo by Laura Chouette on Unsplash" },
    handbagBrown: { url: handbagBrown, attribution: "Photo by Creative Headline on Unsplash" },
    handbagOrange: { url: handbagOrange, attribution: "Photo by Arno Senoner on Unsplash" },
    shoesBlue: { url: shoesBlue, attribution: "Photo by Marcus Lewis on Unsplash" },
    shoesPink: { url: shoesPink, attribution: "Photo by Marcus Lewis on Unsplash" },
    shoesPurple: { url: shoesPurple, attribution: "Photo by Marcus Lewis on Unsplash" },
    watchBrown: { url: watchBrown, attribution: "Photo by WoodWatch on Unsplash" },
    watchGreen: { url: watchGreen, attribution: "Photo by Bruno van der Kraan on Unsplash" },
    watchYellow: { url: watchYellow, attribution: "Photo by Marek Prygiel on Unsplash" },
    ring: { url: ring, attribution: "Photo by Sabrianna on Unsplash" },

};

interface Image {
    name: string;
    width?: string;
    height?: string;
    imageOnly?:boolean;
}

function ImageMapper(props: Image) {
    const {name, width, height, imageOnly} = props;
    // Check if the provided name exists in the imageMap
    if (imageMap[name]) {
        const { url, attribution } = imageMap[name];
        return <div className={styles.imageContainer}>
            <img src={url} alt={name} width={width} height={height} />
            {!imageOnly && <span className={styles.attribution}>@{attribution}</span>}
        </div>;
    } else {
        return <div>No image found for {name}</div>;
    }
}

export default ImageMapper;
