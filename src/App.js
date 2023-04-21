import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API, Storage } from 'aws-amplify';
import {
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View,
  withAuthenticator,
} from '@aws-amplify/ui-react';

import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";

          const App = ({ signOut }) => {
          const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

         async function fetchItems() {
    const apiData = await API.graphql({ query: listNotes });
        const notesFromAPI = apiData.data.listNotes.items;
           await Promise.all(
      notesFromAPI.map(async (item) => {
        if (item.image) {
          const url = await Storage.get(item.name);
          item.image = url;
        }
        return item;
      })
    );
    setItems(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
          const form = new FormData(event.target);
          const image = form.get("image");
          const data = {
      name: form.get("name"),
      description: form.get("description"),
      price: form.get("price"),
      image: image.name,
    };
                 if (!!data.image) await Storage.put(data.name, image);
                 await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchItems();
    event.target.reset();
  }
  

  async function deleteNote({ id, name }) {
                const newNotes = items.filter((item) => item.id !== id);
    setItems(newNotes);
               await Storage.remove(name);
    await API.graphql({
      query: deleteNoteMutation,
            variables: { input: { id } },
    });
  }


  return (
    <View className="App">
      <Heading level={1}>FoodItem</Heading>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
                    <TextField
                     name="name"
                     placeholder="Name"
                     label="Name"
                     labelHidden
                     variation="quiet"
                     required
                     />
                  <TextField
            name="description"
            placeholder="Description"
            label="Description"
            labelHidden
            variation="quiet"
            required
          />
           <TextField
            name="price"
            placeholder="Price"
            label="Price"
            labelHidden
            variation="quiet"
            required
          />
           <View
              name="image"
              as="input"
             type="file"
              style={{ alignSelf: "end" }}
            />
          <Button type="submit" variation="primary">
            Add Item
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Items</Heading>
      <View margin="3rem 0">
      {items.map((item) => (
  <Flex
     key={item.id || item.name}
    direction="row"
    justifyContent="center"
    alignItems="center"
  >
    <Text as="strong" fontWeight={600}>
      {item.name}
    </Text>
    <Text as="span">{item.description}</Text>
    <Text as="span">{item.price}</Text>
    {item.image && (
      <Image
        src={item.image}
        alt={`visual aid for ${items.name}`}
        style={{ width: 300 }}
      />
    )}
    <Button variation="link" onClick={() => deleteNote(item)}>
      Delete Item
    </Button>
  </Flex>
))}

      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};


export default withAuthenticator(App);