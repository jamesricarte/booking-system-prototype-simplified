import Nav from '../../components/Nav';

const HistoryOfOccupancy = () => {
  return (
    <>
      <Nav />
      <main className="flex flex-col items-center">
        <h3>History of Occupancy</h3>
        <table className="border-collapse">
          <thead>
            <tr>
              <td>Room Number</td>
              <td>Class</td>
              <td>Faculty</td>
              <td>Time</td>
              <td>Date</td>
              <td>User Account</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>201</td>
              <td>1A</td>
              <td>Rogie A. Bolon</td>
              <td>7:30-9:00</td>
              <td>03-09-2025</td>
              <td>Rogie A. Bolon</td>
            </tr>
            <tr>
              <td>202</td>
              <td>1B</td>
              <td>Marites 0. Olesco</td>
              <td>13:00-14:30</td>
              <td>03-09-2025</td>
              <td>Marites 0. Olesco</td>
            </tr>
            <tr>
              <td>203</td>
              <td>2C</td>
              <td>Kim Arvin P. Leocadio</td>
              <td>17:00-19:00</td>
              <td>03-09-2025</td>
              <td>Kim Arvin P. Leocadio</td>
            </tr>
          </tbody>
        </table>
      </main>
    </>
  );
};

export default HistoryOfOccupancy;
