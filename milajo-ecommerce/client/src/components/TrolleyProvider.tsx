import { createContext, Dispatch, SetStateAction, useState, ReactNode  } from 'react';

interface TrolleyItem {
    id: number;
    title: string;
    imageName: string;
    price: string;
    quantity:number
  }
  
export const TrolleyContext = createContext<TrolleyItem[]>([]);
export const TrolleyDispatchContext = createContext<Dispatch<SetStateAction<TrolleyItem[]>> | undefined>(undefined);

function TrolleyProvider(props: { children: ReactNode }) {
  const { children } = props;
  const [trolleyItems, setTrolleyItems] = useState<TrolleyItem[]>([]);

  return (
    <TrolleyContext.Provider value={trolleyItems}>
      <TrolleyDispatchContext.Provider value={setTrolleyItems}>
        {children}
      </TrolleyDispatchContext.Provider>
    </TrolleyContext.Provider>
  );
}  

export default TrolleyProvider;
