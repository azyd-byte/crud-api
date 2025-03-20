import React, { useEffect, useState } from "react";
import axios from "axios";

const Table = () => {
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [message, setMessage] = useState(""); // Notifikasi
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState(""); // State untuk pencarian
  const [filterName, setFilterName] = useState(""); // State untuk filter nama

  //Fetch data dari API saat komponen pertama kali dimuat
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .get("https://67d2916190e0670699be1f4c.mockapi.io/sekolah/get-all")
      .then((response) => {
        setData(response.data); //simpan data ke state
      })
      .catch((error) => {
        console.log("Error fetching data: ", error);
      });
  };

  //Fungsi untuk menambah data
  const handleAdd = (e) => {
    e.preventDefault();
    if (editId) {
      //Jika sedang dalam mode edit, panggil updateData()
      updateData();
    } else {
      axios
        .post("https://67d2916190e0670699be1f4c.mockapi.io/sekolah/get-all", {
          name,
          avatar,
        })
        .then((response) => {
          setData([...data, response.data]); // update state dengan data baru
          setName(""); //reset form
          setAvatar("");
          setMessage("✅ Data berhasil ditambahkan!"); //set notifikasi

          setTimeout(() => setMessage(""), 2500);
        })
        .catch((error) => {
          console.error("Error adding data: ", error);
          setMessage("❌ Gagal menambahkan data!");
        });
    }
  };

  //Fungsi untuk mengisi form dengan data yang akan diedit
  const handleEdit = (item) => {
    setEditId(item?.id);
    setName(item?.name);
    setAvatar(item?.avatar);
  };

  //fungsi untuk mengupdate data
  const updateData = () => {
    axios
      .put(
        `https://67d2916190e0670699be1f4c.mockapi.io/sekolah/get-all/${editId}`,
        {
          name,
          avatar,
        }
      )
      .then((response) => {
        setData(
          data.map((item) => (item.id === editId ? response.data : item))
        );
        setName("");
        setAvatar("");
        setEditId(null);
        setMessage("✅ Data berhasil diperbarui!");
        setTimeout(() => setMessage(""), 3000);
      })
      .catch((error) => {
        console.error("Error updating data:", error);
        setMessage("❌ Gagal memperbarui data!");
      });
  };

  // Fungsi Hapus Data
  const handleDelete = (id, name) => {
    if (window.confirm(`Apakah kamu yakin ingin menghapus ${name}?`)) {
      axios
        .delete(
          `https://67d2916190e0670699be1f4c.mockapi.io/sekolah/get-all/${id}`
        )
        .then(() => {
          setData(data.filter((item) => item.id !== id)); // Hapus data dari state
          setMessage("✅ Data berhasil dihapus!");
          setTimeout(() => setMessage(""), 3000);
        })
        .catch((error) => {
          console.error("Error deleting data:", error);
          setMessage("❌ Gagal menghapus data!");
        });
    }
  };

  //Filter pencarian
  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterName
        ? item.name.toLowerCase().includes(filterName.toLowerCase())
        : true)
  );

  //pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div style={{ margin: "30px" }}>
      <h2>Data Sekolah</h2>

      {/* Notifikasi */}
      {message && (
        <div
          style={{
            background: "#dff0d8",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
          }}
        >
          {message}
        </div>
      )}

      {/* Form Pencarian & Filter */}
      <div>
        <input
          type="text"
          placeholder="Cari nama"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: "10px", padding: "5px" }}
        />
        {/* <input
          type="text"
          placeholder="Filter Nama"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          style={{ marginleft: "10px", padding: "5px" }}
        /> */}
      </div>

      {/* Form Tambah/Edit Data */}
      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Nama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Avatar"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          required
        />
        <button type="submit">{editId ? "Update" : "Tambah"}</button>
      </form>

      {/* Tabel Data */}
      <table border="1" width="80%" style={{ tableLayout: "fixed" }}>
        <thead>
          <tr>
            <th style={{ width: "3%" }}>ID</th>
            <th style={{ width: "15%" }}>Nama</th>
            <th style={{ width: "30%" }}>Avatar</th>
            <th style={{ width: "10%" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <tr key={item.id}>
                <td>{indexOfFirstItem + index + 1}</td>{" "}
                {/* Tampilkan ID berdasarkan urutan array */}
                <td>{item?.name}</td>
                <td>{item?.avatar}</td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button
                    onClick={() => handleDelete(item?.id, item?.name)}
                    style={{
                      marginLeft: "5px",
                      background: "red",
                      color: "white",
                    }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">Loading data...</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        {Array.from(
          { length: Math.ceil(filteredData.length / itemsPerPage) },
          (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              style={{ margin: "5px" }}
            >
              {i + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default Table;
