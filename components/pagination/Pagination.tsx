import Button from "../button/button";
import Icon from "../icon/icon";
import styles from "./pagination.module.scss";
import Text from "@/components/text";

interface Props {
  currentPage: number;
  totalPages: number;
  numbersToDisplay?: number;
  handlePageClick: (index: number) => void;
}

export const Pagination = (props: Props) => {
  return (
    <div
      key="pagination"
      className={styles.Container}
      style={{ border: "none" }}
    >
      <div className={styles.Row}>
        <div
          className={styles.IconContainer}
          onClick={() => props.handlePageClick(1)}
          style={{
            opacity: props.currentPage == 1 ? "0.4" : "1",
            cursor: props.currentPage == 1 ? "" : "pointer",
          }}
        >
          <Icon
            themed
            icon={{
              url: "/paginationLeft.svg",
              size: 18,
            }}
          />
        </div>
        <div
          className={styles.Button}
          onClick={
            props.currentPage > 1
              ? () => props.handlePageClick(props.currentPage - 1)
              : () => {}
          }
          style={{
            cursor: props.currentPage == 1 ? "" : "pointer",
          }}
        >
          <Text
            font="proto_mono"
            size="lg"
            opacity={props.currentPage == 1 ? 0.4 : 1}
          >
            {" "}
            {"<"}{" "}
          </Text>
        </div>
        <div className={styles.Numbers}>
          <div className={styles.Numbers}>
            {new Array(props.totalPages)
              .fill(null)
              .map((_, i) => i + 1)
              .map((index) => {
                return (
                  <div
                    key={index}
                    className={styles.Number}
                    onClick={() => props.handlePageClick(index)}
                  >
                    <Text
                      font="proto_mono"
                      size="sm"
                      opacity={index == props.currentPage ? 1 : 0.4}
                    >
                      {index}
                    </Text>
                  </div>
                );
              })}
          </div>
          {/* <div>
              <Text font="proto_mono" size="lg">
                {". . ."}
              </Text>
            </div> */}
          {/* {
              <div className={styles.paginationNumbers}>
                {new Array(props.numbersToDisplay)
                  .fill(null)
                  .map(
                    (_, i) =>
                      props.totalPages - (props.numbersToDisplay ?? 0) + (i + 1)
                  )
                  .map((index) => {
                    return (
                      <div
                        key={index}
                        className={styles.paginationNumber}
                        onClick={() => props.handlePageClick(index)}
                        style={getCurrentPageNumberStyle(index)}
                      >
                        <Text font="proto_mono" size="sm">
                          {index}
                        </Text>
                      </div>
                    );
                  })}
              </div>
            } */}
        </div>

        <div
          className={styles.Button}
          onClick={
            props.currentPage < props.totalPages
              ? () => props.handlePageClick(props.currentPage + 1)
              : () => {}
          }
          style={{
            cursor: props.currentPage == props.totalPages ? "" : "pointer",
          }}
        >
          <Text
            font="proto_mono"
            size="lg"
            opacity={props.currentPage == props.totalPages ? 0.4 : 1}
          >
            {" "}
            {">"}{" "}
          </Text>
        </div>
        <div
          className={styles.IconContainer}
          onClick={() => props.handlePageClick(props.totalPages)}
          style={{
            opacity: props.currentPage == props.totalPages ? "0.4" : "1",
            cursor: props.currentPage == props.totalPages ? "" : "pointer",
          }}
        >
          <Icon
            themed
            icon={{
              url: "/paginationRight.svg",
              size: 18,
            }}
          />
        </div>
      </div>
    </div>
  );
};
